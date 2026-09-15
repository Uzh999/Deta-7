import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import styles from "./Reviews.module.css";

const reviewKeys = ["review1", "review2", "review3", "review4"] as const;

export default function Reviews() {
  const { t } = useTranslation();

  return (
    <section id="reviews" className={styles.section}>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.intro}>
            <div className={styles.introCopy}>
              <div className={styles.kicker}>{t("reviews.kicker")}</div>

              <h2 className={styles.title}>{t("reviews.title")}</h2>

              <p className={styles.description}>{t("reviews.description")}</p>
            </div>

            <div className={styles.ratingCard}>
              <div className={styles.ratingTop}>
                <div className={styles.ratingValue}>4.9</div>
                <div className={styles.ratingMeta}>
                  <div className={styles.stars}>★★★★★</div>
                  <div className={styles.ratingText}>
                    {t("reviews.ratingText")}
                  </div>
                </div>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricValue}>500+</span>
                  <span className={styles.metricLabel}>
                    {t("reviews.metrics.cars")}
                  </span>
                </div>

                <div className={styles.metric}>
                  <span className={styles.metricValue}>5+</span>
                  <span className={styles.metricLabel}>
                    {t("reviews.metrics.years")}
                  </span>
                </div>

                <div className={styles.metric}>
                  <span className={styles.metricValue}>100%</span>
                  <span className={styles.metricLabel}>
                    {t("reviews.metrics.focus")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            {reviewKeys.map((key) => (
              <figure key={key} className={styles.quoteBlock}>
                <div className={styles.cardTop}>
                  <span className={styles.cardStars} aria-hidden="true">
                    ★★★★★
                  </span>
                  <span className={styles.serviceBadge}>
                    {t(`reviews.items.${key}.service`)}
                  </span>
                </div>

                <blockquote className={styles.quote}>
                  {`\u201C${t(`reviews.items.${key}.text`)}\u201D`}
                </blockquote>

                <figcaption className={styles.authorBlock}>
                  <span className={styles.authorName}>
                    {t(`reviews.items.${key}.name`)}
                  </span>
                  <span className={styles.authorMeta}>
                    {t(`reviews.items.${key}.car`)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
