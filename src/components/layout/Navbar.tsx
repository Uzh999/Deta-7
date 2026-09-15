import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "./Container";
import LanguageSwitcher from "./LanguageSwitcher";
import { navigationItems } from "../../data/navigation";
import styles from "./Navbar.module.css";

function CarLogoIcon() {
  return (
    <svg
      className={styles.logoIcon}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 39L18 28C18.8 25.8 20.9 24.3 23.3 24.3H40.7C43.1 24.3 45.2 25.8 46 28L50 39"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 39H53"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M14 39V43.5C14 45.4 15.6 47 17.5 47H19"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M50 39V43.5C50 45.4 48.4 47 46.5 47H45"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M23 24L27.2 18.8C28.2 17.5 29.7 16.8 31.3 16.8H32.7C34.3 16.8 35.8 17.5 36.8 18.8L41 24"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="41.5" r="2.6" fill="currentColor" />
      <circle cx="43" cy="41.5" r="2.6" fill="currentColor" />
    </svg>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1180) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className={styles.wrapper}>
      <Container>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#hero" className={styles.logo} onClick={closeMenu}>
            <span className={styles.logoMark}>
              <CarLogoIcon />
            </span>

            <span className={styles.logoTextGroup}>
              <span className={styles.logoTitle}>Premium Detailing</span>
              <span className={styles.logoSubtitle}>Auto care studio</span>
            </span>
          </a>

          <div className={styles.links}>
            {navigationItems.map((item) => (
              <a key={item.key} href={item.href} className={styles.link}>
                {t(`nav.${item.key}`)}
              </a>
            ))}
          </div>

          <div className={styles.actions}>
            <div className={styles.desktopLanguage}>
              <LanguageSwitcher />
            </div>

            <a href="#contact" className={styles.cta}>
              {t("hero.primaryCta")}
            </a>

            <button
              type="button"
              className={`${styles.burger} ${isOpen ? styles.burgerOpen : ""}`}
              onClick={toggleMenu}
              aria-label={isOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>
      </Container>

      <div
        className={`${styles.mobileOverlay} ${
          isOpen ? styles.mobileOverlayVisible : ""
        }`}
        onClick={closeMenu}
      />

      <div
        id="mobile-menu"
        className={`${styles.mobilePanel} ${
          isOpen ? styles.mobilePanelOpen : ""
        }`}
      >
        <div className={styles.mobileInner}>
          <div className={styles.mobileTop}>
            <a href="#hero" className={styles.mobileLogo} onClick={closeMenu}>
              <span className={styles.logoMark}>
                <CarLogoIcon />
              </span>

              <span className={styles.logoTextGroup}>
                <span className={styles.logoTitle}>Premium Detailing</span>
                <span className={styles.logoSubtitle}>Auto care studio</span>
              </span>
            </a>

            <button
              type="button"
              className={styles.mobileClose}
              onClick={closeMenu}
              aria-label={t("nav.closeMenu")}
            >
              ×
            </button>
          </div>

          <div className={styles.mobileLanguage}>
            <LanguageSwitcher />
          </div>

          <div className={styles.mobileLinks}>
            {navigationItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={styles.mobileLink}
                onClick={closeMenu}
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
          </div>

          <a href="#contact" className={styles.mobileCta} onClick={closeMenu}>
            {t("hero.primaryCta")}
          </a>
        </div>
      </div>
    </div>
  );
}
