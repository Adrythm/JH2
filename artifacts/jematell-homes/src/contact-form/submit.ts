import type { TrackingData } from "./analytics";

export interface SubmitResult {
  success: boolean;
  error?: string;
}

/**
 * The sentence-builder chips behind a composed message. Absent when the
 * visitor typed their own message instead.
 */
export interface ContactSelection {
  action: string;
  topic: string;
  /** Free text, set only when `topic` is "other". */
  otherTopic: string;
  /** Free text, set only when `action` is "ask a question". */
  question: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
  selection?: ContactSelection;
  /** The order-number id also pushed to Tag Manager as `lead.transaction_id`. */
  transaction_id: string;
  tracking: TrackingData;
}

// The api-server is a separate artifact mounted at the proxy root path `/api`
// (most-specific-first routing), so a root-relative URL is correct here: unlike
// same-artifact assets, this must NOT be prefixed with the site BASE path.
const CONTACT_ENDPOINT = "/api/contact";

export async function submitContactForm(data: ContactSubmission): Promise<SubmitResult> {
  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return { success: false, error: `Server responded with ${res.status}` };
    }

    const json = (await res.json()) as { success?: boolean };
    return json.success
      ? { success: true }
      : { success: false, error: "Delivery was not confirmed." };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
