import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { whatsappUrl } from "../../data/contact";
import styles from "./WhatsAppButton.module.css";

/**
 * How far down the page the button waits before appearing, as a share of the
 * viewport height. The hero already carries a gold primary action; a second
 * gold control floating beside it would just split the visitor's attention.
 */
const REVEAL_AT = 0.6;

export default function WhatsAppButton() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsVisible(window.scrollY > window.innerHeight * REVEAL_AT);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const label = t("whatsapp.label");

  return (
    <div className={`${styles.dock} ${isVisible ? styles.dockVisible : ""}`}>
      {/* Hidden from assistive tech: the link itself already carries the same
          wording as its accessible name. */}
      <span className={styles.tooltip} aria-hidden="true">
        {t("whatsapp.tooltip")}
      </span>

      <a
        href={whatsappUrl(t("whatsapp.message"))}
        className={styles.button}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={label}
        /* Nothing below the reveal point should be reachable by keyboard
           while it is invisible. */
        tabIndex={isVisible ? 0 : -1}
      >
        <svg
          className={styles.icon}
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8.8" cy="11.8" r="1" fill="currentColor" />
          <circle cx="12.4" cy="11.8" r="1" fill="currentColor" />
          <circle cx="16" cy="11.8" r="1" fill="currentColor" />
        </svg>
      </a>
    </div>
  );
}
