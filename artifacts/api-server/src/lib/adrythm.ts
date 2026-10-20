/**
 * Mirrors each contact-form lead into AdRhythm.
 *
 * This is a SECONDARY sink. The Postgres `leads` row is the durable record and
 * the two emails are the operational path; AdRhythm keeps a copy for reporting.
 * Everything here follows from that: this module never rejects, never changes
 * the response the visitor gets, and never holds their request open for long.
 * A webhook outage must not cost someone their submission or make the form look
 * broken to them.
 */
import { logger } from "./logger";

/**
 * Per-attempt ceiling. The call is issued concurrently with the two Gmail
 * sends, so in the normal case it adds no latency to the submission at all.
 */
const ATTEMPT_TIMEOUT_MS = 3500;

/**
 * One retry only. AdRhythm confirms retries are safe, but a visitor is waiting
 * on this request, so the worst case stays bounded rather than thorough.
 */
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;

export type AdRhythmOutcome = "sent" | "skipped" | "failed";

/**
 * Field names follow AdRhythm's briefing (`page_url`, snake_case click ids)
 * rather than this codebase's internal shape, so their automatic matching
 * works without a translation step on their side.
 */
export interface AdRhythmLead {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  page_url?: string;
  gclid?: string;
  msclkid?: string;
  fbclid?: string;
  source?: string;
  medium?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  landing_page?: string;
  request_action?: string;
  request_topic?: string;
  /**
   * The order id the form pushed to Tag Manager with the conversion. Adrythm
   * reads it to find the Google Ads conversion when a lead is marked junk.
   */
  transaction_id?: string;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Drop blanks. The tracking payload uses "" for "not captured", which would
 * otherwise arrive as a present-but-empty field and read as real data.
 */
function compact(lead: AdRhythmLead): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(lead)) {
    if (typeof value === "string" && value.trim() !== "") out[key] = value;
  }
  return out;
}

/**
 * Post one lead. Resolves with an outcome instead of throwing so the caller can
 * log it without any chance of it participating in the request's failure path.
 */
export async function postLeadToAdRhythm(lead: AdRhythmLead): Promise<AdRhythmOutcome> {
  const endpoint = process.env.ADRYTHM_WEBHOOK_URL?.trim();
  if (!endpoint) return "skipped";

  const payload = compact(lead);

  // AdRhythm needs at least one way to identify the person. Checking here keeps
  // a pointless round trip — and a confusing error in their dashboard — off the
  // wire entirely.
  if (!payload.email && !payload.phone) {
    logger.warn("AdRhythm: lead carries neither email nor phone; not forwarded");
    return "skipped";
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });

      if (response.status === 200) return "sent";

      // AdRhythm documents 200 as the acknowledgement. Another 2xx is not a
      // failure, but it is not the agreed contract either — accept it, but
      // loudly, so a silent protocol drift on their side is visible here.
      if (response.ok) {
        logger.warn(
          { status: response.status },
          "AdRhythm acknowledged with an unexpected 2xx status",
        );
        return "sent";
      }

      // A 4xx means the body is wrong, and a retry would send the identical
      // body to the identical result. AdRhythm watches for these on their side,
      // so record it and stop rather than hammering them.
      if (response.status < 500 && response.status !== 429) {
        const detail = await response.text().catch(() => "");
        logger.error(
          { status: response.status, detail: detail.slice(0, 300) },
          "AdRhythm rejected the lead; not retrying",
        );
        return "failed";
      }

      logger.warn({ status: response.status, attempt }, "AdRhythm webhook returned a retryable status");
    } catch (err) {
      // Network error or the per-attempt timeout firing.
      logger.warn({ err, attempt }, "AdRhythm webhook attempt failed");
    }

    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
  }

  // Deliberately loud, but not fatal: the lead is still in Postgres and in the
  // team's inbox, so this is a reconciliation problem rather than a lost lead.
  logger.error({ attempts: MAX_ATTEMPTS }, "AdRhythm webhook failed; lead recorded locally only");
  return "failed";
}
