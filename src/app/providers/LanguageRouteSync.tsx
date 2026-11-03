import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isSupportedLanguage } from "../languages";
import { detectPreferredLanguage } from "../detectLanguage";
import { OG_LOCALES, SITE_URL } from "../site";

function setMeta(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

export default function LanguageRouteSync({ children }: PropsWithChildren) {
  const { lang } = useParams();
  const { i18n, t } = useTranslation();

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

  // Per-language head. The build writes the same values into a static
  // /<lang>/index.html for crawlers that do not run scripts; this keeps them
  // right when the visitor switches language in the page.
  useEffect(() => {
    if (!isSupported || !lang) return;

    const title = t("seo.title");
    const description = t("seo.description");
    const url = `${SITE_URL}/${lang}`;

    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[property="og:locale"]', OG_LOCALES[lang]);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", url);
  }, [t, lang, isSupported]);

  if (!isSupported) {
    return <Navigate to={`/${detectPreferredLanguage()}`} replace />;
  }

  return <>{children}</>;
}
