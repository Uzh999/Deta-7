import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "../languages";

export default function LanguageRouteSync({ children }: PropsWithChildren) {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  const isSupported = isSupportedLanguage(lang);

  useEffect(() => {
    if (!isSupported || !lang) return;

    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }

    // Keep the document language in sync so screen readers use the right
    // pronunciation rules and search engines index each locale correctly.
    document.documentElement.lang = lang;
  }, [i18n, lang, isSupported]);

  if (!isSupported) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />;
  }

  return <>{children}</>;
}
