import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Honeypot from "../Honeypot";
import {
  hasSubmittedLead,
  isPlausiblePhone,
  submitLead,
} from "../../lib/leads";
import styles from "./OfferPopup.module.css";

/**
 * Shown on every visit, once per page load: closing it is not remembered.
 * It opens at MIN_DELAY_MS; if the visitor is typing at that moment it waits
 * for them to stop, but never past MAX_DELAY_MS.
 */
const MIN_DELAY_MS = 10000;
const MAX_DELAY_MS = 15000;
const TYPING_POLL_MS = 500;
/** How long the thank-you message stays before the dialog closes itself. */
const SUCCESS_CLOSE_DELAY_MS = 1600;

/** True while focus is in a text field — interrupting typing loses a lead. */
function isVisitorTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;

  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el.getAttribute("role") === "combobox"
  );
}

export default function OfferPopup() {
  const { t, i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const hasTriggeredRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const openedAtRef = useRef(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const openPopup = useCallback(() => {
    if (hasTriggeredRef.current) return;
    // Checked at the moment of opening, not only on mount: the visitor may
    // have sent the contact form in the meantime.
    if (hasSubmittedLead()) return;

    hasTriggeredRef.current = true;
    openedAtRef.current = Date.now();
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (hasSubmittedLead()) return;

    const loadedAt = Date.now();
    let timer = 0;

    const tryOpen = () => {
      const waitedEnough = Date.now() - loadedAt >= MAX_DELAY_MS;

      if (isVisitorTyping() && !waitedEnough) {
        timer = window.setTimeout(tryOpen, TYPING_POLL_MS);
        return;
      }
      openPopup();
    };

    timer = window.setTimeout(tryOpen, MIN_DELAY_MS);

    const handleMouseLeave = (event: MouseEvent) => {
      const isDesktop = window.innerWidth > 768;
      if (!isDesktop) return;
      if (event.clientY > 12) return;
      if (isVisitorTyping()) return;

      openPopup();
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [openPopup]);

  const closePopup = useCallback(() => {
    hasTriggeredRef.current = true;
    setIsOpen(false);
  }, []);

  // Close on its own after a successful send. Lives in an effect so the timer
  // is cleared if the component goes away first.
  useEffect(() => {
    if (status !== "success" || !isOpen) return;

    const timer = window.setTimeout(
      () => setIsOpen(false),
      SUCCESS_CLOSE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [status, isOpen]);

  // Dialog behaviour: lock scroll, move focus in, trap Tab inside the dialog,
  // close on Escape, and hand focus back to wherever it came from.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );

    focusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePopup();
        return;
      }

      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, closePopup]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setStatus("error");
      setErrorMessage(t("offerPopup.error"));
      return;
    }

    if (!isPlausiblePhone(phone)) {
      setStatus("error");
      setErrorMessage(t("offerPopup.phoneInvalid"));
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      await submitLead({
        source: "offer-popup",
        name: name.trim(),
        phone: phone.trim(),
        locale: i18n.language,
        honeypot,
        startedAt: openedAtRef.current,
      });

      setStatus("success");
      setName("");
      setPhone("");
    } catch (error) {
      console.error("Offer popup error:", error);
      setStatus("error");
      setErrorMessage(t("offerPopup.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearStatus = () => {
    if (status !== "idle") setStatus("idle");
    if (errorMessage) setErrorMessage("");
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-popup-title"
      onClick={closePopup}
    >
      <div
        ref={dialogRef}
        className={styles.popup}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={closePopup}
          aria-label={t("offerPopup.close")}
        >
          ×
        </button>

        <div className={styles.kicker}>{t("offerPopup.kicker")}</div>

        <h3 id="offer-popup-title" className={styles.title}>
          {t("offerPopup.title")}
        </h3>

        <p className={styles.description}>{t("offerPopup.description")}</p>

        {status === "success" ? (
          <div className={styles.successBox}>
            <div className={styles.successTitle}>
              {t("offerPopup.successTitle")}
            </div>
            <div className={styles.successText}>
              {t("offerPopup.successText")}
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <Honeypot value={honeypot} onChange={setHoneypot} />

            <label className={styles.field}>
              <span className={styles.label}>{t("offerPopup.nameLabel")}</span>
              <input
                type="text"
                className={styles.input}
                placeholder={t("offerPopup.namePlaceholder")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearStatus();
                }}
                autoComplete="name"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>{t("offerPopup.phoneLabel")}</span>
              <input
                type="tel"
                className={styles.input}
                placeholder={t("offerPopup.phonePlaceholder")}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearStatus();
                }}
                autoComplete="tel"
                required
              />
            </label>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("offerPopup.sending") : t("offerPopup.cta")}
            </button>

            <p className={styles.note}>{t("offerPopup.note")}</p>

            {status === "error" && (
              <p className={styles.errorNote} role="alert">
                {errorMessage || t("offerPopup.error")}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
