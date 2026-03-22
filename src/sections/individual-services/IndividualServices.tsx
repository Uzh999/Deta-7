import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import {
  individualServicesConfig,
  type IndividualServiceCategoryKey,
  type IndividualServiceItemConfig,
} from "../../data/pricing";
import styles from "./IndividualServices.module.css";

const categoryKeys: IndividualServiceCategoryKey[] = [
  "paintCorrection",
  "paintProtection",
  "interiorDetailing",
  "detailsProtection",
  "mechanics",
  "tuning",
];

function isRenderableItem(item: IndividualServiceItemConfig) {
  return (
    item.priceType === "from" ||
    item.priceType === "addon" ||
    item.priceType === "range" ||
    item.priceType === "custom" ||
    item.priceType === "link"
  );
}

export default function IndividualServices() {
  const { t } = useTranslation();

  const renderRightSide = (item: IndividualServiceItemConfig): ReactNode => {
    if (item.priceType === "from" && typeof item.price === "number") {
      return (
        <span className={styles.price}>
          {t("individualServices.priceFormats.from", {
            value: item.price,
          })}
        </span>
      );
    }

    if (item.priceType === "addon" && typeof item.price === "number") {
      return (
        <span className={styles.price}>
          {t("individualServices.priceFormats.addon", {
            value: item.price,
          })}
        </span>
      );
    }

    if (
      item.priceType === "range" &&
      typeof item.minPrice === "number" &&
      typeof item.maxPrice === "number"
    ) {
      return (
        <span className={styles.price}>
          {t("individualServices.priceFormats.range", {
            min: item.minPrice,
            max: item.maxPrice,
          })}
        </span>
      );
    }

    if (item.priceType === "custom") {
      return (
        <span className={styles.price}>
          {t("individualServices.priceFormats.custom")}
        </span>
      );
    }

    if (item.priceType === "link" && item.href) {
      return (
        <a
          href={item.href}
          target={item.target ?? "_self"}
          rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
          className={styles.linkPrice}
        >
          {t("individualServices.priceFormats.link")}
        </a>
      );
    }

    return null;
  };

  return (
    <section id="individual-services" className={styles.section}>
      <Container>
        <SectionHeading
          title={t("individualServices.title")}
          subtitle={t("individualServices.subtitle")}
        />

        <div className={styles.grid}>
          {categoryKeys.map((categoryKey) => {
            const category = individualServicesConfig[categoryKey];

            const itemEntries = Object.entries(category.items).filter(
              ([, item]) => item && isRenderableItem(item),
            );

            return (
              <article key={categoryKey} className={styles.card}>
                <div className={styles.top}>
                  <span className={styles.kicker}>
                    {t(`individualServices.categories.${categoryKey}.kicker`)}
                  </span>

                  <h3 className={styles.title}>
                    {t(`individualServices.categories.${categoryKey}.title`)}
                  </h3>

                  <p className={styles.description}>
                    {t(
                      `individualServices.categories.${categoryKey}.description`,
                    )}
                  </p>
                </div>

                <ul className={styles.list}>
                  {itemEntries.map(([itemKey, item]) => {
                    const path = `individualServices.categories.${categoryKey}.items.${itemKey}`;
                    const label = t(path);

                    if (!label || label === path) {
                      return null;
                    }

                    return (
                      <li key={itemKey} className={styles.item}>
                        <span className={styles.itemName}>{label}</span>
                        {renderRightSide(item)}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
