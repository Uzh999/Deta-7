import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const supportedLanguages = ["ru", "uk", "pl"] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

function isSupportedLanguage(
  value: string | undefined,
): value is SupportedLanguage {
  return !!value && supportedLanguages.includes(value as SupportedLanguage);
}

export default function LanguageRouteSync({ children }: PropsWithChildren) {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (isSupportedLanguage(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [i18n, lang]);

  if (!isSupportedLanguage(lang)) {
    return <Navigate to="/ru" replace />;
  }

  return <>{children}</>;
}
