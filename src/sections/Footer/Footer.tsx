import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import { navigationItems } from "../../data/navigation";
import styles from "./Footer.module.css";

const footerNavKeys = [
  "services",
  "before-after",
  "about",
  "pricing",
  "reviews",
  "contact",
] as const;

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const footerNavItems = useMemo(
    () =>
      navigationItems.filter((item) =>
        footerNavKeys.includes(item.key as (typeof footerNavKeys)[number]),
      ),
    [],
  );

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <div className={styles.eyebrow}>{t("footer.brand")}</div>

            <h2 className={styles.title}>{t("footer.title")}</h2>

            <p className={styles.description}>{t("footer.description")}</p>

            <a href="#contact" className={styles.cta}>
              {t("footer.cta")}
            </a>
          </div>

          <div className={styles.meta}>
            <div className={styles.column}>
              <div className={styles.columnTitle}>{t("footer.navigation")}</div>

              <nav className={styles.nav}>
                {footerNavItems.map((item) => (
                  <a key={item.key} href={item.href} className={styles.link}>
                    {t(`nav.${item.key}`)}
                  </a>
                ))}
              </nav>
            </div>

            <div className={styles.column}>
              <div className={styles.columnTitle}>{t("footer.contacts")}</div>

              <div className={styles.infoList}>
                <a href="tel:+48733892486" className={styles.link}>
                  +48 733 892 486
                </a>

                <div className={styles.textMuted}>{t("footer.address")}</div>
              </div>

              <div className={styles.subBlock}>
                <div className={styles.subTitle}>{t("footer.hoursTitle")}</div>

                <div className={styles.infoList}>
                  <div className={styles.textMuted}>
                    {t("footer.hoursWeek")}
                  </div>
                  <div className={styles.textMuted}>
                    {t("footer.hoursWeekend")}
                  </div>
                  <div className={styles.textMuted}>{t("footer.response")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.bottomText}>
            © {year} {t("footer.brand")}. {t("footer.rights")}
          </div>

          <a href="#hero" className={styles.bottomLink}>
            {t("footer.backToTop")}
          </a>
        </div>
      </Container>
    </footer>
  );
}
