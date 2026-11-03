import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  type SupportedLanguage,
} from "./languages";

/** Key i18next-browser-languagedetector caches the last used language under. */
const STORAGE_KEY = "i18nextLng";

/**
 * Picks the language for a visitor who arrived without one in the URL:
 * their last choice on this site, then their browser's languages in order of
 * preference, then the default.
 */
export function detectPreferredLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // Storage blocked; fall through to the browser languages.
  }

  const browserLanguages =
    typeof navigator === "undefined"
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : [navigator.language];

  for (const tag of browserLanguages) {
    // "uk-UA" → "uk", "en-GB" → "en"
    const base = tag?.toLowerCase().split("-")[0];
    if (isSupportedLanguage(base)) return base;
  }

  return DEFAULT_LANGUAGE;
}
