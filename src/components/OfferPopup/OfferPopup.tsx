import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./OfferPopup.module.css";

const STORAGE_DISMISSED_KEY = "offer-popup-dismissed-at";
const STORAGE_SUBMITTED_KEY = "offer-popup-submitted";
const DISMISS_DAYS = 7;
const MIN_TIME_ON_PAGE_MS = 40000;
const MIN_SCROLL_PERCENT = 60;

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_DISMISSED_KEY);
    if (!raw) return false;

    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;

    const diff = Date.now() - dismissedAt;
    return diff < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function isAlreadySubmitted(): boolean {
  try {
    return localStorage.getItem(STORAGE_SUBMITTED_KEY) === "true";
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(STORAGE_DISMISSED_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

function markSubmitted(): void {
  try {
    localStorage.setItem(STORAGE_SUBMITTED_KEY, "true");
  } catch {
    // ignore
  }
}

function getScrollPercent(): number {
  const scrollTop = window.scrollY || window.pageYOffset;
  const documentHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  if (documentHeight <= 0) return 0;

  return (scrollTop / documentHeight) * 100;
}

/**
 * Server error strings are for the log, not the visitor. This returns the
 * technical detail for `console.error` only; the UI always shows a translated
 * message.
 */
function extractResponseError(
  response: Response,
  responseText: string,
): string {
  try {
    const data = responseText ? JSON.parse(responseText) : null;
    if (data?.error) return String(data.error);
  } catch {
    // Response was not JSON; fall through to the raw text.
  }

  if (responseText?.trim()) {
    return responseText;
  }

  return `Request failed with status ${response.status}`;
}

export default function OfferPopup() {
  const { t, i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const hasTriggeredRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const hasScrolledEnoughRef = useRef(false);
  const hasSpentEnoughTimeRef = useRef(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const openPopup = useCallback(() => {
    if (hasTriggeredRef.current) return;
    if (wasDismissedRecently()) return;
    if (isAlreadySubmitted()) return;
    if (!hasScrolledEnoughRef.current || !hasSpentEnoughTimeRef.current) return;

    hasTriggeredRef.current = true;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (wasDismissedRecently()) return;
    if (isAlreadySubmitted()) return;

    const timer = window.setTimeout(() => {
      hasSpentEnoughTimeRef.current = true;
      openPopup();
    }, MIN_TIME_ON_PAGE_MS);

    const handleScroll = () => {
      if (getScrollPercent() >= MIN_SCROLL_PERCENT) {
        hasScrolledEnoughRef.current = true;
        openPopup();
      }
    };

    const handleMouseLeave = (event: MouseEvent) => {
      const isDesktop = window.innerWidth > 768;
      if (!isDesktop) return;
      if (event.clientY > 12) return;
      if (wasDismissedRecently() || isAlreadySubmitted()) return;

      hasSpentEnoughTimeRef.current = true;
      hasScrolledEnoughRef.current = true;
      openPopup();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    handleScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [openPopup]);

  const closePopup = useCallback(() => {
    hasTriggeredRef.current = true;
    setIsOpen(false);
    markDismissed();
  }, []);

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
      ).filter((el) => !el.hasAttribute("disabled"));

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

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "offer-popup",
          name: name.trim(),
          phone: phone.trim(),
          locale: i18n.language,
          page: `${window.location.pathname}${window.location.hash}`,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(extractResponseError(response, responseText));
      }

      setStatus("success");
      markSubmitted();
      setName("");
      setPhone("");

      window.setTimeout(() => {
        setIsOpen(false);
      }, 1600);
    } catch (error) {
      console.error("Offer popup error:", error);
      setStatus("error");
      setErrorMessage(t("offerPopup.error"));
    } finally {
      setIsSubmitting(false);
    }
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
            <label className={styles.field}>
              <span className={styles.label}>{t("offerPopup.nameLabel")}</span>
              <input
                type="text"
                className={styles.input}
                placeholder={t("offerPopup.namePlaceholder")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (status !== "idle") setStatus("idle");
                  if (errorMessage) setErrorMessage("");
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
                  if (status !== "idle") setStatus("idle");
                  if (errorMessage) setErrorMessage("");
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
