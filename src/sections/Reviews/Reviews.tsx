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
            <div className={styles.kicker}>{t("reviews.kicker")}</div>

            <h2 className={styles.title}>{t("reviews.title")}</h2>

            <p className={styles.description}>{t("reviews.description")}</p>

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
              <article key={key} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardStars}>★★★★★</div>
                  <div className={styles.serviceBadge}>
                    {t(`reviews.items.${key}.service`)}
                  </div>
                </div>

                <p className={styles.quote}>
                  “{t(`reviews.items.${key}.text`)}”
                </p>

                <div className={styles.authorBlock}>
                  <div className={styles.avatar}>
                    {t(`reviews.items.${key}.name`).charAt(0)}
                  </div>

                  <div className={styles.authorInfo}>
                    <div className={styles.authorName}>
                      {t(`reviews.items.${key}.name`)}
                    </div>
                    <div className={styles.authorMeta}>
                      {t(`reviews.items.${key}.car`)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
