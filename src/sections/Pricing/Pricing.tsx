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

  // No package currently configures a badge, so the label row is dropped
  // entirely rather than reserving an empty strip above every column. The
  // row comes back on its own as soon as a badge is set in the config.
  const plans = pricingKeys.map((key) => {
    const config = pricingConfig[key];
    const calculated = calculatePackagePricing(config);

    return {
      key,
      config,
      calculated,
      badgeData: getPricingBadgeData(config, calculated),
    };
  });

  const hasAnyBadge = plans.some((plan) => plan.badgeData !== null);

  return (
    <section id="pricing" className={styles.section}>
      <Container>
        <SectionHeading
          title={t("pricing.title")}
          subtitle={t("pricing.subtitle")}
        />

        <div
          className={`${styles.grid} ${hasAnyBadge ? styles.gridWithBadges : ""}`}
        >
          {plans.map(({ key, config, calculated, badgeData }) => {
            const isFeatured = Boolean(config.featured);

            const badgeToneClass =
              badgeData?.tone === "accent"
                ? styles.badgeAccent
                : styles.badgeMuted;

            return (
              <article
                key={key}
                className={`${styles.plan} ${isFeatured ? styles.featured : ""}`}
              >
                {hasAnyBadge &&
                  (badgeData ? (
                    <span className={`${styles.badge} ${badgeToneClass}`}>
                      {badgeData.mode === "custom" && badgeData.textKey
                        ? t(`pricing.badges.${badgeData.textKey}`)
                        : t("pricing.badges.savings", {
                            value: calculated.savings,
                          })}
                    </span>
                  ) : (
                    <span
                      className={styles.badgePlaceholder}
                      aria-hidden="true"
                    />
                  ))}

                <h3 className={styles.planTitle}>
                  {t(`pricing.items.${key}.title`)}
                </h3>

                <p className={styles.planDescription}>
                  {t(`pricing.items.${key}.description`)}
                </p>

                <ul className={styles.features}>
                  {[1, 2, 3, 4, 5].map((item) => {
                    const path = `pricing.items.${key}.features.${item}`;
                    const value = t(path);

                    if (value === path) return null;

                    return (
                      <li key={item} className={styles.featureItem}>
                        {value}
                      </li>
                    );
                  })}
                </ul>

                <div className={styles.bottom}>
                  <div className={styles.priceBlock}>
                    {calculated.savings > 0 && (
                      <span className={styles.oldPrice}>
                        {formatPrice(calculated.rawPrice)}
                      </span>
                    )}

                    <span className={styles.price}>
                      {formatPrice(calculated.finalPrice)}
                    </span>

                    {calculated.savings > 0 && (
                      <span className={styles.savings}>
                        {t("pricing.savings", { value: calculated.savings })}
                      </span>
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
