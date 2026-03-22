import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import styles from "./Services.module.css";

type ServiceKey = "exterior" | "interior" | "mechanics" | "tuning";

type ServiceItem = {
  key: ServiceKey;
  featured?: boolean;
};

const services: ServiceItem[] = [
  { key: "exterior" },
  { key: "interior" },
  { key: "mechanics" },
  { key: "tuning", featured: false },
];

function ServiceIcon({ type }: { type: ServiceKey }) {
  switch (type) {
    case "exterior":
      return (
        <svg
          viewBox="0 0 24 24"
          className={styles.iconSvg}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 14.5l1.2-4.1A2 2 0 0 1 7.1 9H16.9a2 2 0 0 1 1.9 1.4L20 14.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 14.5h13a1.5 1.5 0 0 1 1.5 1.5v1.2a.8.8 0 0 1-.8.8h-1.4a.8.8 0 0 1-.8-.8v-.7H7v.7a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8V16a1.5 1.5 0 0 1 1.5-1.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="15.5" r="1" fill="currentColor" />
          <circle cx="16.5" cy="15.5" r="1" fill="currentColor" />
        </svg>
      );

    case "interior":
      return (
        <svg
          viewBox="0 0 24 24"
          className={styles.iconSvg}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M7.5 5.5h9a2 2 0 0 1 2 2v4.2a3.8 3.8 0 0 1-3.8 3.8H9.3a3.8 3.8 0 0 1-3.8-3.8V7.5a2 2 0 0 1 2-2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M9 9.2h6M9.2 12h5.6M8.2 18.5h7.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );

    case "mechanics":
      return (
        <svg
          viewBox="0 0 24 24"
          className={styles.iconSvg}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M14.7 6.3a3.2 3.2 0 0 0 4.5 4.5l-4.8 4.8-4.5-4.5 4.8-4.8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8.6 13.4 5 17l2 2 3.6-3.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "tuning":
      return (
        <svg
          viewBox="0 0 24 24"
          className={styles.iconSvg}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 4.5v7l4.8 2.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );

    default:
      return null;
  }
}

export default function Services() {
  const { t } = useTranslation();

  return (
    <section id="services" className={styles.section}>
      <Container>
        <SectionHeading
          title={t("services.title")}
          subtitle={t("services.subtitle")}
        />

        <div className={styles.grid}>
          {services.map((service) => {
            const features = t(`services.items.${service.key}.features`, {
              returnObjects: true,
            }) as string[];

            const coatingLabels =
              service.key === "exterior"
                ? (t("services.items.exterior.coatingLabels", {
                    returnObjects: true,
                  }) as string[])
                : [];

            return (
              <article
                key={service.key}
                className={`${styles.card} ${
                  service.featured ? styles.featured : ""
                }`}
              >
                {service.featured && (
                  <div className={styles.badge}>
                    {t("services.featuredBadge")}
                  </div>
                )}

                <div className={styles.content}>
                  <div className={styles.top}>
                    <div className={styles.iconWrap}>
                      <ServiceIcon type={service.key} />
                    </div>

                    <div className={styles.kicker}>
                      {t(`services.items.${service.key}.kicker`)}
                    </div>

                    <h3 className={styles.title}>
                      {t(`services.items.${service.key}.title`)}
                    </h3>

                    <p className={styles.description}>
                      {t(`services.items.${service.key}.description`)}
                    </p>
                  </div>

                  <ul className={styles.features}>
                    {features.map((feature) => (
                      <li key={feature} className={styles.featureItem}>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {service.key === "exterior" && (
                    <div className={styles.subsection}>
                      <div className={styles.subsectionTitle}>
                        {t("services.items.exterior.coatingsTitle")}
                      </div>

                      <ul className={styles.subfeatures}>
                        {coatingLabels.map((item) => (
                          <li key={item} className={styles.subfeatureItem}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {service.key === "tuning" && (
                    <div className={styles.note}>
                      {t("services.items.tuning.note")}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
