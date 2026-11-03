/**
 * Site-wide constants shared by the app and the build (vite.config.ts), so
 * this file must stay free of browser-only APIs.
 */

/** Production origin, no trailing slash. Used for canonical and og:url. */
export const SITE_URL = "https://premium-detailing.vercel.app";

/** Open Graph locale per site language. */
export const OG_LOCALES = {
  pl: "pl_PL",
  uk: "uk_UA",
  ru: "ru_RU",
  en: "en_GB",
} as const;
