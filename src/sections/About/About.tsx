import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import styles from "./About.module.css";

const valueKeys = ["approach", "details", "expertise", "result"] as const;

export default function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className={styles.section}>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.intro}>
            <div className={styles.copy}>
              <SectionHeading
                title={t("about.title")}
                subtitle={t("about.subtitle")}
              />

              <p className={styles.description}>{t("about.description")}</p>
            </div>

            <div className={styles.stats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>500+</span>
                <span className={styles.statLabel}>
                  {t("about.stats.cars")}
                </span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statValue}>5+</span>
                <span className={styles.statLabel}>
                  {t("about.stats.years")}
                </span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statValue}>360°</span>
                <span className={styles.statLabel}>
                  {t("about.stats.approach")}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.values}>
            {valueKeys.map((key) => (
              <article key={key} className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  {t(`about.items.${key}.icon`)}
                </div>

                <div className={styles.valueBody}>
                  <span className={styles.valueKicker}>
                    {t(`about.items.${key}.kicker`)}
                  </span>

                  <h3 className={styles.valueTitle}>
                    {t(`about.items.${key}.title`)}
                  </h3>

                  <p className={styles.valueText}>
                    {t(`about.items.${key}.description`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
