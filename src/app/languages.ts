/** Single source of truth for the locales the site ships. */
export const SUPPORTED_LANGUAGES = ["ru", "uk", "pl", "en"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Locale a bare "/" redirects to. Note that i18n's `fallbackLng` is "pl"
 * while this default is "ru" — preserved from the original behaviour, since
 * which language visitors land on is a business decision.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = "ru";

export function isSupportedLanguage(
  value: string | undefined,
): value is SupportedLanguage {
  return (
    !!value && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
  );
}
