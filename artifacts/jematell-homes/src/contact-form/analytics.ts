/**
 * Lead attribution tracking.
 *
 * Captures marketing attribution on the visitor's first page load (first-touch,
 * persisted in sessionStorage) so it survives client-side navigation before they
 * open the contact form. When UTM params are present they win; otherwise ad
 * click ids decide (gclid -> google/cpc, msclkid -> bing/cpc, fbclid ->
 * facebook/paid-social) BEFORE the referrer is consulted — auto-tagged ad
 * clicks arrive with search/social referrers and would otherwise read as
 * organic. Only then is document.referrer classified (search engines ->
 * organic, social networks -> social, anything else -> referral; no referrer
 * -> direct).
 */

export interface TrackingData {
  gclid: string;
  /** Microsoft Advertising click id (auto-tagging). */
  msclkid: string;
  /** Meta (Facebook/Instagram) click id. */
  fbclid: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  source: string;
  medium: string;
  referrer: string;
  landing_page: string;
  trigger_url: string;
}

type Attribution = Omit<TrackingData, "trigger_url">;

const STORAGE_KEY = "jh_attribution";

const EMPTY: TrackingData = {
  gclid: "",
  msclkid: "",
  fbclid: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  source: "",
  medium: "",
  referrer: "",
  landing_page: "",
  trigger_url: "",
};

// Token -> canonical source name. Matched as a substring of the referrer host,
// so "www.google.com", "news.google.com", "google.co.uk" all resolve to "google".
const SEARCH_ENGINES: Record<string, string> = {
  google: "google",
  bing: "bing",
  yahoo: "yahoo",
  duckduckgo: "duckduckgo",
  ecosia: "ecosia",
  baidu: "baidu",
  yandex: "yandex",
  brave: "brave",
  startpage: "startpage",
  aol: "aol",
  ask: "ask",
};

const SOCIAL_NETWORKS: Record<string, string> = {
  facebook: "facebook",
  "fb.com": "facebook",
  "fb.me": "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  "lnkd.in": "linkedin",
  "t.co": "twitter",
  twitter: "twitter",
  "x.com": "twitter",
  youtube: "youtube",
  "youtu.be": "youtube",
  pinterest: "pinterest",
  "pin.it": "pinterest",
  tiktok: "tiktok",
  reddit: "reddit",
  threads: "threads",
  nextdoor: "nextdoor",
  tumblr: "tumblr",
};

function classifyReferrer(
  referrer: string,
  ids: { gclid: string; msclkid: string; fbclid: string },
): { source: string; medium: string } {
  // Platform click ids are checked FIRST, before the referrer host. An
  // auto-tagged ad click usually arrives WITH a search/social referrer
  // (google.com, googleadservices.com, bing.com, facebook.com), so testing the
  // host first classified paid clicks as organic/social — exactly the
  // paid-vs-organic confusion this data exists to prevent.
  if (ids.gclid) return { source: "google", medium: "cpc" };
  if (ids.msclkid) return { source: "bing", medium: "cpc" };
  if (ids.fbclid) return { source: "facebook", medium: "paid-social" };

  if (!referrer) return { source: "direct", medium: "(none)" };

  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return { source: "direct", medium: "(none)" };
  }

  // Same-site referral (internal navigation) counts as direct.
  if (typeof window !== "undefined" && host === window.location.hostname.toLowerCase()) {
    return { source: "direct", medium: "(none)" };
  }

  const cleanHost = host.replace(/^www\./, "");

  for (const [token, name] of Object.entries(SEARCH_ENGINES)) {
    if (host.includes(token)) return { source: name, medium: "organic" };
  }
  for (const [token, name] of Object.entries(SOCIAL_NETWORKS)) {
    if (host.includes(token)) return { source: name, medium: "social" };
  }

  return { source: cleanHost, medium: "referral" };
}

function detectAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get("utm_source") || "";
  const utm_medium = params.get("utm_medium") || "";
  const utm_campaign = params.get("utm_campaign") || "";
  const gclid = params.get("gclid") || "";
  const msclkid = params.get("msclkid") || "";
  const fbclid = params.get("fbclid") || "";
  const referrer = document.referrer || "";

  let source = utm_source;
  let medium = utm_medium;
  if (!source || !medium) {
    const derived = classifyReferrer(referrer, { gclid, msclkid, fbclid });
    if (!source) source = derived.source;
    if (!medium) medium = derived.medium;
  }

  return {
    gclid,
    msclkid,
    fbclid,
    utm_source,
    utm_medium,
    utm_campaign,
    source,
    medium,
    referrer,
    landing_page: window.location.href,
  };
}

/**
 * Capture first-touch attribution as early as possible. Safe to call on every
 * mount — it only writes once per session, preserving the original landing
 * referrer/UTMs even after the visitor navigates client-side.
 */
export function initTracking(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(detectAttribution()));
  } catch {
    // sessionStorage may be unavailable (private mode, etc.) — fail silently.
  }
}

export function getTrackingData(): TrackingData {
  if (typeof window === "undefined") return EMPTY;

  let stored: Attribution | null = null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Attribution;
  } catch {
    stored = null;
  }
  // Fallback if init never ran (e.g. storage blocked): detect on the spot.
  const attr = stored ?? detectAttribution();

  return { ...EMPTY, ...attr, trigger_url: window.location.href };
}

/**
 * No-op by design. GTM is installed site-wide in the app shell, not lazily by
 * the form — a container that only loads once the modal opens would miss every
 * page_view. Kept as a call site so the form's mount effect stays stable.
 */
export function loadGTM(): void {}

/* -------------------------------------------------------------------------
 * Enhanced conversions normalization.
 *
 * Google hashes user-provided data client-side before it leaves the browser,
 * but it hashes EXACTLY what we hand it — so the normalization has to happen
 * here or the hash won't match Google's copy and the match silently fails.
 * Rules per Google Ads "enhanced conversions for leads": trim, lowercase,
 * E.164 phone numbers, and strip the dots gmail ignores.
 * ---------------------------------------------------------------------- */

/** E.164: +<country><digits>. Assumes US when no country code is present. */
function toE164(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) digits = "1" + digits;
  // Anything that isn't a plausible NANP number is dropped rather than sent
  // malformed — a bad value is worse than a missing one, it poisons the match.
  if (digits.length !== 11 || digits[0] !== "1") return "";
  return "+" + digits;
}

/**
 * gmail.com and googlemail.com ignore dots in the local part, so
 * `first.last@gmail.com` and `firstlast@gmail.com` are one inbox and must
 * produce one hash. Every other domain keeps its local part verbatim.
 */
function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1 || at === trimmed.length - 1) return "";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return local.replace(/\./g, "") + "@" + domain;
  }
  return trimmed;
}

/** The form takes one free-text name field; Google wants the parts separately. */
function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/**
 * One transaction id per submission, shaped like an order number:
 * `ADR-<yyyymmdd>-<10 random letters and digits>`. Made once, before the form
 * posts, and used twice: posted with the submission (so the portal can find
 * the Google Ads conversion when a lead is marked junk and withdraw it) and
 * pushed as `lead.transaction_id` (the Ads tag's order id). Never built from
 * the email or phone: Google asks that an order id identify no one and not be
 * a hash (support.google.com/google-ads/answer/6386790).
 */
export function newTransactionId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let random = "";
  for (const b of bytes) random += alphabet[b % alphabet.length];
  const d = new Date();
  const day =
    String(d.getUTCFullYear()) +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0");
  return `ADR-${day}-${random}`;
}

interface DataLayerWindow extends Window {
  dataLayer?: Record<string, unknown>[];
}

/**
 * Pushes the lead event GTM listens for. One event drives all three tags:
 * the Google Ads conversion, the Ads user-provided-data event (enhanced
 * conversions), and the GA4 `generate_lead` event — so they can never disagree
 * about whether a lead happened.
 */
export function reportConversion(
  formData: { name: string; email: string; phone: string },
  eventName: string,
  isNew: boolean,
  value: number,
  transactionId: string,
): void {
  if (typeof window === "undefined") return;

  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];

  const email = normalizeEmail(formData.email);
  const phone = toE164(formData.phone);
  const { first, last } = splitName(formData.name);
  const tracking = getTrackingData();

  // Null out the previous lead first. dataLayer state persists across pushes,
  // so without this a second submission in the same session would inherit any
  // field the new one happens to leave empty — i.e. attribute lead B to
  // person A. Same reasoning as clearing `ecommerce` before a new push.
  w.dataLayer.push({ lead: null, user_data: null });

  w.dataLayer.push({
    event: "generate_lead",
    lead: {
      form: eventName,
      is_new: isNew,
      value,
      currency: "USD",
      transaction_id: transactionId,
    },
    // Key names are Google's, not ours: the Code method for enhanced
    // conversions expects exactly `email`, `phone_number`, and a nested
    // `address` with `first_name`/`last_name`. Renaming any of these makes the
    // User-Provided Data variable read undefined and the match fails silently.
    user_data: {
      email,
      phone_number: phone,
      address: { first_name: first, last_name: last, country: "US" },
    },
    attribution: {
      gclid: tracking.gclid,
      msclkid: tracking.msclkid,
      source: tracking.source,
      medium: tracking.medium,
      campaign: tracking.utm_campaign,
      // Two different questions, both worth answering:
      //   landing_page    - where they ENTERED the site (first touch, session-persisted)
      //   conversion_page - where they actually SUBMITTED (`trigger_url`)
      // The form is a portal modal, not a route, so the second is the article
      // or service page they were reading — not always /contact. With 1,000+
      // content pages that's the signal telling us which ones produce leads.
      landing_page: tracking.landing_page,
      conversion_page: tracking.trigger_url,
    },
  });
}
