import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LANGUAGE_DISPLAY_ORDER,
  LANGUAGE_META,
  type SupportedLanguage,
} from "../../app/languages";
import { useLanguageNavigation } from "./useLanguageNavigation";
import styles from "./LanguageSelect.module.css";

/**
 * Compact language picker for the desktop bar: one pill showing the current
 * code, opening a short list with each language's own name. Replaces a row of
 * four buttons that left too little room for the links in longer languages.
 *
 * Follows the WAI-ARIA menu-button pattern with radio items: focus moves into
 * the list, arrows move between languages, Escape returns to the button.
 */
export default function LanguageSelect() {
  const { t } = useTranslation();
  const { current, switchTo } = useLanguageNavigation();
  const menuId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusItem = (index: number) => {
    const count = LANGUAGE_DISPLAY_ORDER.length;
    itemRefs.current[(index + count) % count]?.focus();
  };

  const currentIndex = Math.max(
    0,
    LANGUAGE_DISPLAY_ORDER.indexOf(current ?? "pl"),
  );

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const choose = (code: SupportedLanguage) => {
    switchTo(code);
    close(true);
  };

  // On open, put focus on the language already in use.
  useEffect(() => {
    if (isOpen) focusItem(currentIndex);
  }, [isOpen, currentIndex]);

  // Pointer-down outside closes it; a drag that starts inside does not.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  const onButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    const index = itemRefs.current.findIndex(
      (el) => el === document.activeElement,
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItem(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItem(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusItem(0);
        break;
      case "End":
        event.preventDefault();
        focusItem(LANGUAGE_DISPLAY_ORDER.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  const short = current ? LANGUAGE_META[current].short : "—";

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`${t("nav.language")}: ${
          current ? LANGUAGE_META[current].native : ""
        }`}
        onClick={() => (isOpen ? close(false) : setIsOpen(true))}
        onKeyDown={onButtonKeyDown}
      >
        <svg
          className={styles.globe}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>

        <span className={styles.code}>{short}</span>

        <svg
          className={styles.chevron}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <polyline
            points="6 9 12 15 18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("nav.language")}
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          {LANGUAGE_DISPLAY_ORDER.map((code, index) => {
            const isActive = code === current;

            return (
              <button
                key={code}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                lang={code}
                tabIndex={-1}
                className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                onClick={() => choose(code)}
              >
                <span className={styles.itemName}>
                  {LANGUAGE_META[code].native}
                </span>
                <span className={styles.itemCode}>
                  {LANGUAGE_META[code].short}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
