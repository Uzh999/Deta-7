import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import Navbar from "../../components/layout/Navbar";
import styles from "./Hero.module.css";

export default function Hero() {
  const { t } = useTranslation();

  const trustItems = [
    {
      value: t("hero.trust.years.value"),
      label: t("hero.trust.years.label"),
    },
    {
      value: t("hero.trust.cars.value"),
      label: t("hero.trust.cars.label"),
    },
    {
      value: t("hero.trust.rating.value"),
      label: t("hero.trust.rating.label"),
    },
  ];

  return (
    <section id="hero" className={styles.hero}>
      <Navbar />

      <div className={styles.backgroundGlow} />
      <div className={styles.overlay} />
      <div className={styles.noise} />

      <Container>
        <div className={styles.grid}>
          <div className={styles.content}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              {t("hero.badge")}
            </div>

            <h1 className={styles.title}>{t("hero.title")}</h1>

            <p className={styles.description}>{t("hero.description")}</p>

            <div className={styles.buttons}>
              <a href="#contact" className={styles.primaryButton}>
                {t("hero.primaryCta")}
              </a>

              <a href="#pricing" className={styles.secondaryButton}>
                {t("hero.secondaryCta")}
              </a>
            </div>

            <div className={styles.trustRow}>
              {trustItems.map((item) => (
                <div
                  key={`${item.value}-${item.label}`}
                  className={styles.trustItem}
                >
                  <span className={styles.trustValue}>{item.value}</span>
                  <span className={styles.trustLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.visual}>
            <div className={styles.visualImage} />
            <div className={styles.visualShade} />
            <div className={styles.visualVignette} />
            <div className={styles.visualReflection} />

            <div className={styles.visualTopBadge}>
              {t("hero.visual.topBadge")}
            </div>

            <div className={styles.visualPanel}>
              <div className={styles.visualPanelKicker}>
                {t("hero.visual.kicker")}
              </div>

              <div className={styles.visualPanelTitle}>
                {t("hero.visual.title")}
              </div>

              <div className={styles.visualPanelText}>
                {t("hero.visual.text")}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
