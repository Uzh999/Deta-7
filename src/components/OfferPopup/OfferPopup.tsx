"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./OfferPopup.module.css";

const STORAGE_SUBMITTED_KEY = "offer-popup-submitted";
const MIN_TIME_ON_PAGE_MS = 10000;
const DESKTOP_MIN_WIDTH = 768;
const EXIT_INTENT_MAX_Y = 10;

type LeadForm = {
  name: string;
  phone: string;
};

function isAlreadySubmitted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_SUBMITTED_KEY) === "true";
  } catch {
    return false;
  }
}

function markSubmitted(): void {
  try {
    window.localStorage.setItem(STORAGE_SUBMITTED_KEY, "true");
  } catch {
    // Storage may be unavailable in private browsing.
  }
}

export default function OfferPopup() {
  const { t, i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<LeadForm>({
    name: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const hasTriggeredRef = useRef(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const successTimerRef = useRef<number | null>(null);

  const openPopup = useCallback(() => {
    if (hasTriggeredRef.current) return;
    if (isAlreadySubmitted()) return;

    hasTriggeredRef.current = true;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (isAlreadySubmitted()) return;

    const timer = window.setTimeout(openPopup, MIN_TIME_ON_PAGE_MS);

    const handleMouseLeave = (event: MouseEvent) => {
      if (window.innerWidth <= DESKTOP_MIN_WIDTH) return;
      if (event.clientY > EXIT_INTENT_MAX_Y) return;
      if (isAlreadySubmitted()) return;

      openPopup();
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [openPopup]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
        return;
      }

      if (event.key !== "Tab") return;

      const popup = popupRef.current;
      if (!popup) return;

      const focusableElements = popup.querySelectorAll<HTMLElement>(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "textarea:not([disabled])",
          "select:not([disabled])",
          '[tabindex]:not([tabindex="-1"])',
        ].join(","),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

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
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, closePopup]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    closePopup();
  }, [closePopup]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          locale: i18n.language,
          page: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      markSubmitted();
      setIsSuccess(true);

      successTimerRef.current = window.setTimeout(() => {
        setIsOpen(false);
      }, 1600);
    } catch (err) {
      console.error("Failed to submit offer form:", err);
      setError(t("offer.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={handleOverlayClick}>
      <div
        ref={popupRef}
        className={styles.popup}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-popup-title"
        aria-describedby="offer-popup-description"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={t("offer.close")}
        >
          &times;
        </button>

        {isSuccess ? (
          <div className={styles.success} role="status">
            <h2 id="offer-popup-title">{t("offer.successTitle")}</h2>
            <p>{t("offer.successMessage")}</p>
          </div>
        ) : (
          <>
            <h2 id="offer-popup-title" className={styles.title}>
              {t("offer.title")}
            </h2>

            <p id="offer-popup-description" className={styles.description}>
              {t("offer.description")}
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label} htmlFor="offer-name">
                {t("offer.nameLabel")}
              </label>

              <input
                id="offer-name"
                className={styles.input}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t("offer.namePlaceholder")}
                autoComplete="name"
                required
                maxLength={100}
                disabled={isSubmitting}
              />

              <label className={styles.label} htmlFor="offer-phone">
                {t("offer.phoneLabel")}
              </label>

              <input
                id="offer-phone"
                className={styles.input}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t("offer.phonePlaceholder")}
                autoComplete="tel"
                required
                maxLength={30}
                disabled={isSubmitting}
              />

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("offer.submitting") : t("offer.submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
