import { useTranslation } from "react-i18next";

import Container from "../../components/layout/Container";
import styles from "./FreeConsultation.module.css";

type FreeConsultationProps = {
  /** Preselects the matching option in the contact form. */
  onRequest: () => void;
};

export default function FreeConsultation({ onRequest }: FreeConsultationProps) {
  const { t } = useTranslation();

  const points = t("freeConsultation.points", {
    returnObjects: true,
  }) as string[];

  return (
    <section id="free-consultation" className={styles.section}>
      <Container>
        <div className={styles.band}>
          <div className={styles.copy}>
            <span className={styles.kicker}>
              {t("freeConsultation.kicker")}
            </span>

            <h2 className={styles.title}>{t("freeConsultation.title")}</h2>

            <p className={styles.description}>
              {t("freeConsultation.description")}
            </p>
          </div>

          <div className={styles.aside}>
            <ul className={styles.points}>
              {points.map((point) => (
                <li key={point} className={styles.point}>
                  {point}
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <a href="#contact" className={styles.cta} onClick={onRequest}>
                {t("freeConsultation.cta")}
              </a>

              <span className={styles.note}>{t("freeConsultation.note")}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
