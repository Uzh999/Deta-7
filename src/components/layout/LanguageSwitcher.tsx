import { useTranslation } from "react-i18next";
import { LANGUAGE_DISPLAY_ORDER, LANGUAGE_META } from "../../app/languages";
import { useLanguageNavigation } from "./useLanguageNavigation";
import styles from "./LanguageSwitcher.module.css";

/**
 * Segmented row of all four languages. Used in the mobile menu, where there is
 * room for it and one tap beats opening a list. The desktop bar uses the
 * compact LanguageSelect instead.
 */
export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { current, switchTo } = useLanguageNavigation();

  return (
    <div className={styles.switcher} role="group" aria-label={t("nav.language")}>
      {LANGUAGE_DISPLAY_ORDER.map((code) => {
        const isActive = current === code;

        return (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => switchTo(code)}
            className={`${styles.button} ${isActive ? styles.active : ""}`}
            aria-pressed={isActive}
            aria-label={LANGUAGE_META[code].native}
          >
            {LANGUAGE_META[code].short}
          </button>
        );
      })}
    </div>
  );
}
