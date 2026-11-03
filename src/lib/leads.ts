/**
 * Everything both lead forms (the contact section and the offer popup) share:
 * the request, error handling, spam-protection fields and the "already sent a
 * lead" flag. Limits mirror `api/leads.ts` — keep the two in step.
 */

export const MESSAGE_MAX = 200;

/** Name of the honeypot field. Must match the check in `api/leads.ts`. */
export const HONEYPOT_FIELD = "company";

const SUBMITTED_KEY = "offer-popup-submitted";

export type LeadRequest = {
  source: "contact-form" | "offer-popup";
  name: string;
  phone: string;
  service?: string;
  message?: string;
  locale: string;
  /** Value of the honeypot input; empty for real visitors. */
  honeypot: string;
  /** When the visitor started on the form (`Date.now()`). */
  startedAt: number;
};

/**
 * Server error strings are for the log, not the visitor. This returns the
 * technical detail for `console.error` only; the UI always shows a translated
 * message.
 */
function extractResponseError(response: Response, responseText: string) {
  try {
    const data = responseText ? JSON.parse(responseText) : null;
    if (data?.error) return String(data.error);
  } catch {
    // Response was not JSON; fall through to the raw text.
  }

  if (responseText.trim()) return responseText;

  return `Request failed with status ${response.status}`;
}

/** Sends a lead. Resolves on success, throws with technical detail otherwise. */
export async function submitLead({
  honeypot,
  startedAt,
  ...lead
}: LeadRequest): Promise<void> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...lead,
      [HONEYPOT_FIELD]: honeypot,
      elapsedMs: Date.now() - startedAt,
      page: `${window.location.pathname}${window.location.hash}`,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(extractResponseError(response, responseText));
  }

  markLeadSubmitted();
}

/**
 * Same rule the server applies: only phone characters, and 7–15 digits.
 * Checked before sending so the visitor gets a specific message instead of a
 * generic failure.
 */
export function isPlausiblePhone(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length > 30 || !/^[\d\s+().-]+$/.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
}

/** Remembered so the offer popup never asks someone who already wrote in. */
function markLeadSubmitted(): void {
  try {
    localStorage.setItem(SUBMITTED_KEY, "true");
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
  }
}

export function hasSubmittedLead(): boolean {
  try {
    return localStorage.getItem(SUBMITTED_KEY) === "true";
  } catch {
    return false;
  }
}
