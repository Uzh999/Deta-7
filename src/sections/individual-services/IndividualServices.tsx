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

const PRICE_LIST_COLUMNS = 2;

/**
 * Distributes the categories across columns, keeping each category whole and
 * the columns close in length. Greedy by running row count: a category joins
 * whichever column is currently shortest.
 */
function splitIntoColumns(
  keys: IndividualServiceCategoryKey[],
  weightOf: (key: IndividualServiceCategoryKey) => number,
): IndividualServiceCategoryKey[][] {
  const columns: IndividualServiceCategoryKey[][] = Array.from(
    { length: PRICE_LIST_COLUMNS },
    () => [],
  );
  const weights = new Array<number>(PRICE_LIST_COLUMNS).fill(0);

  keys.forEach((key) => {
    const target = weights.indexOf(Math.min(...weights));
    columns[target].push(key);
    // The header costs roughly two rows of vertical space.
    weights[target] += weightOf(key) + 2;
  });

  return columns;
}

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

  const renderableItems = (categoryKey: IndividualServiceCategoryKey) =>
    Object.entries(individualServicesConfig[categoryKey].items).filter(
      ([, item]) => item && isRenderableItem(item),
    );

  const columns = splitIntoColumns(
    categoryKeys,
    (key) => renderableItems(key).length,
  );

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

    if (item.priceType === "link") {
      // The tuning entries are configured as links but their href is not set
      // yet, which left the price column blank. Fall back to the same
      // "quoted individually" label the other unpriced services use.
      if (!item.href) {
        return (
          <span className={styles.price}>
            {t("individualServices.priceFormats.custom")}
          </span>
        );
      }

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

        <div className={styles.list}>
          {columns.map((columnKeys, columnIndex) => (
            <div key={columnIndex} className={styles.column}>
              {columnKeys.map((categoryKey) => {
                const itemEntries = renderableItems(categoryKey);

                return (
              <section key={categoryKey} className={styles.category}>
                <header className={styles.categoryHead}>
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
                </header>

                <ul className={styles.items}>
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
                  </section>
                );
              })}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
