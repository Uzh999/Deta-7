import { useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { isSupportedLanguage, type SupportedLanguage } from "../../app/languages";

/** Current language from the URL, and a way to switch that keeps the hash. */
export function useLanguageNavigation() {
  const navigate = useNavigate();
  const { lang } = useParams();
  const { hash } = useLocation();

  const current = isSupportedLanguage(lang) ? lang : null;

  const switchTo = useCallback(
    (code: SupportedLanguage) => {
      if (code === current) return;
      navigate({ pathname: `/${code}`, hash });
    },
    [current, hash, navigate],
  );

  return { current, switchTo };
}
