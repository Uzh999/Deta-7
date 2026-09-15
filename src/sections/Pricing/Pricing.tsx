import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import {
  calculatePackagePricing,
  formatPrice,
  getPricingBadgeData,
  pricingConfig,
  type PricingKey,
} from "../../data/pricing";
import styles from "./Pricing.module.css";

const pricingKeys: PricingKey[] = [
  "basic",
  "salePrep",
  "premium",
  "premium2Step",
];

export default function Pricing() {
  const { t } = useTranslation();

  return (
    <section id="pricing" className={styles.section}>
      <Container>
        <SectionHeading
          title={t("pricing.title")}
          subtitle={t("pricing.subtitle")}
        />

        <div className={styles.grid}>
          {pricingKeys.map((key) => {
            const config = pricingConfig[key];
            const calculated = calculatePackagePricing(config);
            const isFeatured = Boolean(config.featured);
            const badgeData = getPricingBadgeData(config, calculated);

            const badgeToneClass =
              badgeData?.tone === "accent"
                ? styles.badgeAccent
                : styles.badgeMuted;

            return (
              <article
                key={key}
                className={`${styles.card} ${isFeatured ? styles.featured : ""}`}
              >
                {badgeData && (
                  <div className={`${styles.badge} ${badgeToneClass}`}>
                    {badgeData.mode === "custom" && badgeData.textKey
                      ? t(`pricing.badges.${badgeData.textKey}`)
                      : t("pricing.badges.savings", {
                          value: calculated.savings,
                        })}
                  </div>
                )}

                <div className={styles.content}>
                  <div className={styles.top}>
                    <h3 className={styles.planTitle}>
                      {t(`pricing.items.${key}.title`)}
                    </h3>

                    <p className={styles.planDescription}>
                      {t(`pricing.items.${key}.description`)}
                    </p>
                  </div>

                  <ul className={styles.features}>
                    {[1, 2, 3, 4, 5].map((item) => {
                      const path = `pricing.items.${key}.features.${item}`;
                      const value = t(path);

                      if (value === path) return null;

                      return (
                        <li key={item} className={styles.featureItem}>
                          <span className={styles.check}>✓</span>
                          <span>{value}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className={styles.bottom}>
                  <div className={styles.priceBlock}>
                    {calculated.savings > 0 && (
                      <div className={styles.oldPrice}>
                        {formatPrice(calculated.rawPrice)}
                      </div>
                    )}

                    <span className={styles.price}>
                      {formatPrice(calculated.finalPrice)}
                    </span>

                    {calculated.savings > 0 && (
                      <div className={styles.savings}>
                        {t("pricing.savings", { value: calculated.savings })}
                      </div>
                    )}
                  </div>

                  <a href="#contact" className={styles.button}>
                    {t("pricing.cta")}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
