/**
 * One source for the studio's phone number. It appears in the footer, in the
 * floating chat button and in any link that dials it, and the three must never
 * drift apart.
 */

/** As written for people to read. */
export const PHONE_DISPLAY = "+48 733 892 486";

/** E.164, for `tel:` links. */
export const PHONE_TEL = "+48733892486";

/** wa.me wants the number with no plus, spaces or dashes. */
const PHONE_WA = "48733892486";

/**
 * Opens a WhatsApp conversation with the studio. `text` is optional; when
 * given it is prefilled in the composer, so the visitor only has to hit send.
 */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${PHONE_WA}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
