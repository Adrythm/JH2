import { Router, type IRouter, type Request, type Response } from "express";
import { SubmitContactBody, SubmitContactResponse } from "@workspace/api-zod";
// Gmail integration (connection: google-mail). Sends lead notifications via the
// Replit Connectors proxy, which injects OAuth2 tokens automatically.
import { ReplitConnectors } from "@replit/connectors-sdk";
import { db, leads } from "@workspace/db";
import { postLeadToAdRhythm } from "../lib/adrythm";

import { ackLeadIn } from "./contact-ack-copy.js";
/**
 * contact.ts — POST /api/contact
 *
 * One submission produces one database row and two deliberately separate
 * emails:
 *
 *   1. An acknowledgment to the lead, CC'd to the team inbox. This is the
 *      thread the team replies on, so it contains nothing a customer should
 *      not see — no attribution, no internal labels.
 *   2. An attribution report to marketing, carrying the full tracking
 *      breakdown, sent nowhere near the customer.
 *
 * These used to be a single email: the team inbox received the card WITH
 * attribution and a Reply-To pointing at the lead. Hitting Reply quoted the
 * whole message back to the customer, ad source and all. Splitting the two
 * removes the leak path outright instead of relying on someone remembering to
 * trim a quoted section they cannot even see by default.
 *
 * Because the team's copy no longer carries attribution, the database row is
 * now the durable record of where a lead came from — see the leads table.
 */

const router: IRouter = Router();

const connectors = new ReplitConnectors();

// The shared inbox the team answers from. CC'd on the acknowledgment so the
// reply thread is already sitting in their mailbox.
const DEFAULT_TEAM_INBOX = ["info@jematellhomes.com"];
// Marketing. Receives the attribution breakdown, and only that.
const DEFAULT_ATTRIBUTION_TO = ["gepley@adrythm.com"];

// Mirrors the website's contact-form siteConfig. The api-server cannot import
// the web artifact, so these are duplicated; keep them in sync with
// artifacts/jematell-homes/src/contact-form/siteConfig.ts.
const BUSINESS_NAME = "Jematell Homes";
const PHONE_DISPLAY = "(602) 421-5576";
const PHONE_HREF = "tel:+16024215576";
const EMAIL_DISPLAY = "info@jematellhomes.com";
const SITE_URL = "https://jematellhomes.com/";
const PRODUCTION_ASSET_BASE = "https://jematellhomes.com";

/**
 * Where email images are fetched from. Email clients have no origin to resolve
 * a relative path against, so these must be absolute and publicly reachable.
 *
 * In development the production copy of an asset may not be published yet, so
 * a test email would show a broken image. Falling back to this repl's own
 * public dev domain makes test sends render properly.
 *
 * The dev branch requires NODE_ENV to be *explicitly* "development" rather than
 * merely "not production". This fails safe: an unset or unexpected NODE_ENV in
 * a deployment falls through to the real domain, so the worst case is a broken
 * image in a dev test rather than a dev URL inside a real customer's email.
 */
function assetBase(): string {
  const override = process.env.CONTACT_ASSET_BASE_URL?.trim();
  if (override) return override.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development" && process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return PRODUCTION_ASSET_BASE;
}

/**
 * Deliberately NOT the site's images/logo.png — that file is a WebP carrying a
 * .png extension. Browsers sniff the real format and render it, but Gmail does
 * not decode WebP here and shows a black box instead. This one is a genuine
 * PNG, flattened onto the email's background so it also survives dark mode.
 */
const getLogoUrl = (): string => `${assetBase()}/images/logo-email.png`;
const BRAND_TAGLINE = "Family-Owned Arizona Home Builder";
const ADDRESS_LINE = "8350 E Raintree Dr Ste 210, Scottsdale, AZ 85260";
const ROC_LINE = "ROC# 339367";

function envList(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

const getTeamInbox = (): string[] => envList("CONTACT_TEAM_INBOX", DEFAULT_TEAM_INBOX);
const getAttributionTo = (): string[] =>
  envList("CONTACT_ATTRIBUTION_TO", DEFAULT_ATTRIBUTION_TO);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// RFC 2822 headers must not contain CR/LF (header-injection guard) — collapse
// any newlines a lead may have typed into a single-line field.
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

const isAscii = (value: string): boolean => !/[^\x20-\x7E]/.test(value);

// Headers fold at whitespace, so a run of non-space characters longer than the
// fold width cannot be broken. Encoding such a run as fixed-size RFC 2047 words
// makes it foldable, which is why length alone can force encoding.
const MAX_UNBREAKABLE_RUN = 70;

function needsEncoding(value: string): boolean {
  if (!isAscii(value)) return true;
  return value.split(/\s+/).some((token) => token.length > MAX_UNBREAKABLE_RUN);
}

/**
 * RFC 2047 encoded-words. Header values are ASCII-only on the wire, so a lead
 * named "José" or a subject with an em dash has to be encoded or it arrives as
 * mojibake.
 *
 * An encoded-word may not exceed 75 characters, so long values become several
 * words separated by whitespace (a decoder drops the whitespace between
 * adjacent words and reassembles the original). The `=?UTF-8?B?` + `?=`
 * wrapper costs 12 characters, leaving 63 for base64, i.e. 45 raw bytes — and
 * chunking is done by code point so a multi-byte character is never split
 * across two words.
 */
const MAX_RAW_BYTES_PER_WORD = 45;

function encodeHeaderWord(value: string): string {
  if (!needsEncoding(value)) return value;

  const words: string[] = [];
  let chunk: number[] = [];
  for (const char of value) {
    const bytes = [...Buffer.from(char, "utf-8")];
    if (chunk.length + bytes.length > MAX_RAW_BYTES_PER_WORD) {
      words.push(Buffer.from(chunk).toString("base64"));
      chunk = [];
    }
    chunk.push(...bytes);
  }
  if (chunk.length > 0) words.push(Buffer.from(chunk).toString("base64"));

  return words.map((word) => `=?UTF-8?B?${word}?=`).join(" ");
}

/**
 * Fold a header onto continuation lines. RFC 5322 caps a line at 998 octets
 * and recommends 78; folding inserts CRLF + space at existing whitespace,
 * which the receiver unfolds back to the original value. Anything that cannot
 * be folded has already been turned into encoded-words upstream.
 */
const FOLD_WIDTH = 76;

function foldHeader(name: string, value: string): string {
  const lines: string[] = [];
  let line = `${name}:`;
  for (const token of value.split(/\s+/).filter(Boolean)) {
    if (line !== `${name}:` && line.length + 1 + token.length > FOLD_WIDTH) {
      lines.push(line);
      line = "";
    }
    line += ` ${token}`;
  }
  lines.push(line);
  return lines.join("\r\n");
}

/** `"Display Name" <addr@example.com>`, safe for arbitrary lead names. */
function formatAddress(name: string, email: string): string {
  const cleanEmail = sanitizeHeader(email);
  const cleanName = sanitizeHeader(name);
  if (!cleanName) return cleanEmail;
  // An encoded-word must not sit inside a quoted string, so it is either
  // quoted or encoded, never both.
  const display = needsEncoding(cleanName)
    ? encodeHeaderWord(cleanName)
    : `"${cleanName.replace(/["\\]/g, "")}"`;
  return `${display} <${cleanEmail}>`;
}

function base64Url(input: string): string {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Body parts are base64 rather than 7bit. The copy contains an em dash, and
 * leads type non-ASCII characters constantly; declaring utf-8 while sending
 * 7bit is what produces garbled text in some clients.
 */
function base64Body(value: string): string {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/(.{76})/g, "$1\r\n");
}

type ContactBody = ReturnType<typeof SubmitContactBody.parse>;

/* -------------------------------------------------------------------------
   Shared presentation
   ------------------------------------------------------------------------- */

function row(label: string, value: string): string {
  return value
    ? `<tr><td style="padding:6px 16px 6px 0;color:#6b5d4f;font-size:13px;white-space:nowrap;vertical-align:top">${escapeHtml(
        label,
      )}</td><td style="padding:6px 0;color:#2b2018;font-size:14px">${escapeHtml(value)}</td></tr>`
    : "";
}

function detailRows(data: ContactBody): string {
  return `${row("Name", data.name)}${row("Email", data.email)}${row("Phone", data.phone)}`;
}

function messageBlock(data: ContactBody): string {
  const messageHtml = escapeHtml(data.message).replace(/\n/g, "<br>");
  return `<div style="margin-top:18px">
          <div style="color:#6b5d4f;font-size:13px;margin-bottom:6px">Message</div>
          <div style="color:#2b2018;font-size:14px;line-height:1.6;background:#f6f2ec;border-radius:10px;padding:14px 16px">${
            messageHtml || "<em>(no message)</em>"
          }</div>
        </div>`;
}

/** The card shell both emails share, so they stay visually identical. */
function shell(headline: string, inner: string, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f2ec;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e7ded2">
      <div style="background:#2b2018;color:#fff;padding:20px 24px">
        <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.7">${escapeHtml(
          BUSINESS_NAME,
        )}</div>
        <div style="font-size:20px;font-weight:600;margin-top:4px">${escapeHtml(headline)}</div>
      </div>
      <div style="padding:20px 24px">${inner}</div>
    </div>
    <div style="color:#9a8c7c;font-size:11px;text-align:center;margin-top:14px">${escapeHtml(footer)}</div>
  </div>
</body></html>`;
}

/* -------------------------------------------------------------------------
   1. Customer acknowledgment — mirrors the form's own thank-you step.
      Nothing internal here: the team replies on this thread, so anything in
      it is something the customer will read.
   ------------------------------------------------------------------------- */

const ACK_SIGNOFF = `Thanks again for choosing ${BUSINESS_NAME}. We look forward to speaking with you soon.`;

/** Keep the phone number from breaking across lines in narrow clients. */
const PHONE_NOWRAP = PHONE_DISPLAY.replace(/ /g, "&nbsp;").replace(/-/g, "&#8209;");

const ACK_LINK = "color:#8a5a2b; text-decoration:none; border-bottom:1px solid #d9c6ae;";
const ACK_SANS = "Arial, Helvetica, sans-serif";
const ACK_SERIF = "Georgia, 'Times New Roman', serif";

/**
 * One label/value pair in the "What you sent us" table. The stack-label and
 * stack-value classes let the media query collapse the two columns into rows
 * on narrow screens, which is the only way a fixed-width email table reflows.
 */
function ackDetailRow(label: string, valueHtml: string, last: boolean): string {
  const pad = last ? "0" : "0 0 14px 0";
  return `<tr>
                      <td class="stack-label" width="90" valign="top" style="width:90px; padding:${pad}; font-family:${ACK_SANS}; font-size:13px; line-height:22px; mso-line-height-rule:exactly; color:#8a7c6c;">${label}</td>
                      <td class="stack-value" valign="top" style="padding:${pad}; font-family:${ACK_SANS}; font-size:15px; line-height:22px; mso-line-height-rule:exactly; color:#2b211a;">${valueHtml}</td>
                    </tr>`;
}

/**
 * The acknowledgment is built as a table-based email rather than reusing the
 * plain internal `shell`: it is the only one of the two a customer ever sees,
 * so it carries the brand, and it has to survive Outlook, which ignores most
 * modern CSS. Hence the nested tables, inline styles, and mso hints.
 */
function buildAckHtml(data: ContactBody, leadIn: string): string {
  const email = escapeHtml(data.email);
  const messageHtml = escapeHtml(data.message).replace(/\n/g, "<br>");
  const quoted = data.message.trim() ? `&ldquo;${messageHtml}&rdquo;` : "(no message)";

  const rows =
    ackDetailRow("Name", escapeHtml(data.name), false) +
    ackDetailRow("Email", `<a href="mailto:${email}" style="${ACK_LINK}">${email}</a>`, !data.phone) +
    (data.phone ? ackDetailRow("Phone", escapeHtml(data.phone), true) : "");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>We received your message | ${escapeHtml(BUSINESS_NAME)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .px { padding-left: 24px !important; padding-right: 24px !important; }
    .stack-label { display: block !important; width: 100% !important; padding-bottom: 2px !important; }
    .stack-value { display: block !important; width: 100% !important; padding-bottom: 14px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f4f2ec; word-spacing:normal;">
<div style="display:none; font-size:1px; color:#f4f2ec; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">Thank you, we&rsquo;ve received your message and will reply within one business day.&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f2ec;">
  <tr>
    <td align="center" style="padding:48px 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px; max-width:600px;">
        <tr>
          <td align="center" style="padding:0 0 28px 0;">
            <a href="${SITE_URL}" style="text-decoration:none;"><img src="${getLogoUrl()}" width="150" alt="${escapeHtml(
              BUSINESS_NAME,
            )}" style="display:block; width:150px; height:auto; border:0; margin:0 auto; background-color:#f4f2ec;"></a>
            <div style="font-family:${ACK_SANS}; font-size:10px; line-height:16px; mso-line-height-rule:exactly; color:#8a7c6c; letter-spacing:3px; text-transform:uppercase; padding-top:10px;">${escapeHtml(
              BRAND_TAGLINE,
            ).replace(/ /g, "&nbsp;")}</div>
          </td>
        </tr>
        <tr>
          <td style="background-color:#fdfbf7; border-radius:6px; border:1px solid #e2d9cb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td class="px" style="background-color:#2b211a; border-radius:5px 5px 0 0; padding:40px 48px 36px 48px;">
                  <div style="font-family:${ACK_SANS}; font-size:11px; line-height:16px; mso-line-height-rule:exactly; color:#b8a58e; letter-spacing:3px; text-transform:uppercase;">Message received</div>
                  <div style="font-family:${ACK_SERIF}; font-size:30px; line-height:38px; mso-line-height-rule:exactly; color:#f6f1e8; padding-top:10px;">Thank you. We&rsquo;re on&nbsp;it.</div>
                </td>
              </tr>
              <tr>
                <td class="px" style="padding:36px 48px 0 48px;">
                  <p style="margin:0; font-family:${ACK_SANS}; font-size:16px; line-height:26px; mso-line-height-rule:exactly; color:#3f362c;">${escapeHtml(
                    leadIn,
                  )}</p>
                  <p style="margin:16px 0 0 0; font-family:${ACK_SANS}; font-size:16px; line-height:26px; mso-line-height-rule:exactly; color:#3f362c;">If your matter is urgent, call us directly at <a href="${PHONE_HREF}" style="${ACK_LINK}">${PHONE_NOWRAP}</a>.</p>
                </td>
              </tr>
              <tr>
                <td class="px" style="padding:32px 48px 0 48px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr><td style="border-top:1px solid #e7ddce; font-size:0; line-height:0;">&nbsp;</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="px" style="padding:28px 48px 0 48px;">
                  <div style="font-family:${ACK_SANS}; font-size:11px; line-height:16px; mso-line-height-rule:exactly; color:#8a7c6c; letter-spacing:3px; text-transform:uppercase; padding-bottom:18px;">What you sent us</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    ${rows}
                  </table>
                </td>
              </tr>
              <tr>
                <td class="px" style="padding:24px 48px 40px 48px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="background-color:#f4eee3; border-left:3px solid #b8a58e; padding:18px 22px;">
                        <div style="font-family:${ACK_SANS}; font-size:11px; line-height:16px; mso-line-height-rule:exactly; color:#8a7c6c; letter-spacing:2px; text-transform:uppercase; padding-bottom:8px;">Your message</div>
                        <div style="font-family:${ACK_SERIF}; font-size:15px; line-height:24px; mso-line-height-rule:exactly; color:#3f362c; font-style:italic;">${quoted}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" class="px" style="padding:28px 48px 0 48px;">
            <p style="margin:0; font-family:${ACK_SANS}; font-size:12px; line-height:20px; mso-line-height-rule:exactly; color:#8a7c6c;">${escapeHtml(
              ACK_SIGNOFF,
            )}</p>
            <p style="margin:14px 0 0 0; font-family:${ACK_SANS}; font-size:11px; line-height:18px; mso-line-height-rule:exactly; color:#a89a88;">${escapeHtml(
              BUSINESS_NAME,
            )} &middot; ${escapeHtml(ADDRESS_LINE)} &middot; ${escapeHtml(ROC_LINE).replace(
              /# /,
              "#&nbsp;",
            )}<br><a href="mailto:${EMAIL_DISPLAY}" style="color:#8a7c6c; text-decoration:underline;">${EMAIL_DISPLAY}</a> &middot; <a href="${PHONE_HREF}" style="color:#8a7c6c; text-decoration:none;">${PHONE_NOWRAP}</a> &middot; <a href="${SITE_URL}" style="color:#8a7c6c; text-decoration:underline;">jematellhomes.com</a><br>You&rsquo;re receiving this one-time confirmation because you contacted us through our website.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildAckText(data: ContactBody, leadIn: string): string {
  return [
    "THANK YOU. WE'RE ON IT.",
    "",
    leadIn,
    `If your matter is urgent, call us directly at ${PHONE_DISPLAY}.`,
    "",
    "WHAT YOU SENT US",
    `  Name: ${data.name}`,
    `  Email: ${data.email}`,
    ...(data.phone ? [`  Phone: ${data.phone}`] : []),
    "",
    "  Your message:",
    `  ${data.message || "(no message)"}`,
    "",
    ACK_SIGNOFF,
    "",
    `${BUSINESS_NAME} · ${ADDRESS_LINE} · ${ROC_LINE}`,
    `${EMAIL_DISPLAY} · ${PHONE_DISPLAY} · jematellhomes.com`,
    "You're receiving this one-time confirmation because you contacted us through our website.",
  ].join("\n");
}

/* -------------------------------------------------------------------------
   2. Attribution report — marketing only. Never sent to the lead, and its
      Reply-To deliberately does not point at one.
   ------------------------------------------------------------------------- */

function buildAttributionHtml(data: ContactBody): string {
  const t = data.tracking;
  const inner = `<table style="width:100%;border-collapse:collapse">${detailRows(data)}</table>
        ${messageBlock(data)}
        <div style="margin-top:18px;border-top:1px solid #e7ded2;padding-top:14px">
          <div style="color:#6b5d4f;font-size:13px;margin-bottom:6px">Attribution</div>
          <table style="width:100%;border-collapse:collapse">
            ${row("Source", t.source)}
            ${row("Medium", t.medium)}
            ${row("Campaign", t.utm_campaign)}
            ${row("UTM source", t.utm_source)}
            ${row("UTM medium", t.utm_medium)}
            ${row("Google Click ID", t.gclid)}
            ${row("Referrer", t.referrer)}
            ${row("Landing page", t.landing_page)}
            ${row("Submitted from", t.trigger_url)}
          </table>
        </div>`;
  return shell(
    "New website lead",
    inner,
    `Sent automatically by the ${BUSINESS_NAME} website contact form.`,
  );
}

function buildAttributionText(data: ContactBody): string {
  const t = data.tracking;
  return [
    `New website lead — ${BUSINESS_NAME}`,
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "(none)"}`,
    "",
    "Message:",
    data.message || "(no message)",
    "",
    "Attribution:",
    `  Source: ${t.source || "(none)"}`,
    `  Medium: ${t.medium || "(none)"}`,
    `  Campaign: ${t.utm_campaign || "(none)"}`,
    `  UTM source: ${t.utm_source || "(none)"}`,
    `  UTM medium: ${t.utm_medium || "(none)"}`,
    `  Google Click ID: ${t.gclid || "(none)"}`,
    `  Referrer: ${t.referrer || "(none)"}`,
    `  Landing page: ${t.landing_page || "(none)"}`,
    `  Submitted from: ${t.trigger_url || "(none)"}`,
  ].join("\n");
}

/* -------------------------------------------------------------------------
   Delivery
   ------------------------------------------------------------------------- */

interface MailOptions {
  to: string[];
  cc?: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}

function buildRawMessage(o: MailOptions): string {
  const boundary = `jh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const headers = [
    foldHeader("To", o.to.join(", ")),
    ...(o.cc && o.cc.length ? [foldHeader("Cc", o.cc.join(", "))] : []),
    ...(o.replyTo ? [foldHeader("Reply-To", sanitizeHeader(o.replyTo))] : []),
    foldHeader("Subject", encodeHeaderWord(sanitizeHeader(o.subject))),
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join("\r\n");

  const body = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Body(o.text),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Body(o.html),
    "",
    `--${boundary}--`,
  ].join("\r\n");

  return `${headers}\r\n\r\n${body}`;
}

async function sendMail(raw: string): Promise<void> {
  const response = await connectors.proxy(
    "google-mail",
    "/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw: base64Url(raw) }),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Gmail responded ${response.status}: ${detail.slice(0, 300)}`);
  }
}

router.post("/contact", async (req: Request, res: Response): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid submission." });
    return;
  }
  const data = parsed.data;
  const t = data.tracking;

  // Persist before sending. This row is the only durable copy of the
  // attribution now that the team's email no longer carries it, so it must not
  // depend on either send succeeding.
  let stored = false;
  try {
    await db.insert(leads).values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      source: t.source,
      medium: t.medium,
      utmSource: t.utm_source,
      utmMedium: t.utm_medium,
      utmCampaign: t.utm_campaign,
      gclid: t.gclid,
      referrer: t.referrer,
      landingPage: t.landing_page,
      triggerUrl: t.trigger_url,
      requestAction: data.selection?.action ?? "",
      requestTopic: data.selection?.topic ?? "",
      requestOtherTopic: data.selection?.otherTopic ?? "",
    });
    stored = true;
  } catch (err) {
    req.log.error({ err }, "Failed to store lead");
  }

  const teamInbox = getTeamInbox();
  const attributionTo = getAttributionTo();
  const leadIn = ackLeadIn(data.selection);

  const ack = buildRawMessage({
    to: [formatAddress(data.name, data.email)],
    // The team is CC'd rather than sent a separate copy, so replying here
    // reaches the customer on a thread that is already customer-safe.
    cc: teamInbox,
    subject: `Thank you for contacting ${BUSINESS_NAME}`,
    text: buildAckText(data, leadIn),
    html: buildAckHtml(data, leadIn),
  });

  const attribution = buildRawMessage({
    to: attributionTo,
    // Pointedly not the lead. This message carries the attribution block, so
    // there must be no path by which a reply to it reaches the customer.
    replyTo: teamInbox.join(", "),
    subject: `New website lead: ${data.name}`,
    text: buildAttributionText(data),
    html: buildAttributionHtml(data),
  });

  // Fire-and-forget by design, and deliberately NOT part of the awaited batch
  // below. AdRhythm is a reporting mirror; if it were awaited, an outage there
  // would spend its whole retry budget while the visitor waits — seconds added
  // to every submission, which is exactly the visitor-facing change this
  // integration must not make. Kicked off here so it still overlaps the sends.
  void postLeadToAdRhythm({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    // The page they actually submitted from. The form is a modal rather
    // than a route, so this is the article or service page they were
    // reading — not /contact.
    page_url: t.trigger_url || t.landing_page,
    gclid: t.gclid,
    msclkid: t.msclkid,
    fbclid: t.fbclid,
    source: t.source,
    medium: t.medium,
    utm_source: t.utm_source,
    utm_medium: t.utm_medium,
    utm_campaign: t.utm_campaign,
    referrer: t.referrer,
    landing_page: t.landing_page,
    request_action: data.selection?.action,
    request_topic: data.selection?.topic,
    transaction_id: data.transaction_id,
  })
    .then((adrythm) => {
      req.log.info({ adrythm }, "AdRhythm lead forwarding finished");
    })
    .catch((err) => {
      // postLeadToAdRhythm is written never to reject. This is a backstop so a
      // future change there can never surface as an unhandled rejection.
      req.log.error({ err }, "AdRhythm lead forwarding threw unexpectedly");
    });

  const [ackResult, attrResult] = await Promise.allSettled([
    sendMail(ack),
    sendMail(attribution),
  ]);

  const ackOk = ackResult.status === "fulfilled";
  const attrOk = attrResult.status === "fulfilled";
  if (!ackOk) {
    req.log.error({ err: (ackResult as PromiseRejectedResult).reason }, "Lead acknowledgment failed");
  }
  if (!attrOk) {
    req.log.error({ err: (attrResult as PromiseRejectedResult).reason }, "Lead attribution email failed");
  }

  // Deliberately excludes AdRhythm: it is a reporting mirror, so its being
  // down is no reason to tell the visitor their message failed.
  // Only a total loss is an error: if the row landed, the lead is recoverable
  // even when Gmail is down, and telling the visitor their message failed
  // would just make them submit again.
  if (!stored && !ackOk && !attrOk) {
    res.status(502).json({ error: "Could not deliver the message." });
    return;
  }

  req.log.info({ stored, ackOk, attrOk, teamInbox, attributionTo }, "Contact form lead processed");
  res.json(SubmitContactResponse.parse({ success: true }));
});

export default router;
