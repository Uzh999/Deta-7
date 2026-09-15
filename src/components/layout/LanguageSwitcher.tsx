import { useNavigate, useParams } from "react-router-dom";
import { SUPPORTED_LANGUAGES } from "../../app/languages";
import styles from "./LanguageSwitcher.module.css";

const LANGUAGE_LABELS: Record<(typeof SUPPORTED_LANGUAGES)[number], string> = {
  pl: "PL",
  uk: "UA",
  ru: "RU",
};

/** Display order, independent of the internal locale list order. */
const DISPLAY_ORDER = ["pl", "uk", "ru"] as const;

export default function LanguageSwitcher() {
  const navigate = useNavigate();
  const { lang } = useParams();

  return (
    <div className={styles.switcher} role="group" aria-label="Language">
      {DISPLAY_ORDER.map((code) => {
        const isActive = lang === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => navigate(`/${code}`)}
            className={`${styles.button} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "true" : undefined}
          >
            {LANGUAGE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
