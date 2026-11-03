/** Single source of truth for the locales the site ships. */
export const SUPPORTED_LANGUAGES = ["ru", "uk", "pl", "en"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Used when nothing about the visitor points to another language. Polish: the
 * studio is in Poland, and it matches i18n's `fallbackLng` and the
 * `x-default` hreflang, which previously disagreed with a "ru" default.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = "pl";

export function isSupportedLanguage(
  value: string | null | undefined,
): value is SupportedLanguage {
  return (
    !!value && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
  );
}

/** Order the languages are offered in the switcher. */
export const LANGUAGE_DISPLAY_ORDER: readonly SupportedLanguage[] = [
  "pl",
  "uk",
  "ru",
  "en",
];

/** Short code on the switcher, and each language's own name for itself. */
export const LANGUAGE_META: Record<
  SupportedLanguage,
  { short: string; native: string }
> = {
  pl: { short: "PL", native: "Polski" },
  uk: { short: "UA", native: "Українська" },
  ru: { short: "RU", native: "Русский" },
  en: { short: "EN", native: "English" },
};
