import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import Container from "../../components/layout/Container";
import ErrorBoundary from "../../components/ErrorBoundary";
import styles from "./Location.module.css";

const LocationMap = lazy(() => import("./LocationMap"));

const STUDIO_ADDRESS = "Mikołaja Reja 13, 62-020 Swarzędz, Poland";

const MAP_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  STUDIO_ADDRESS,
)}`;

/** Start fetching the map chunk slightly before the section scrolls in. */
const MAP_PRELOAD_MARGIN = "400px";

export default function Location() {
  const { t } = useTranslation();

  const sectionRef = useRef<HTMLElement | null>(null);
  // Browsers without IntersectionObserver skip the deferral and load the map
  // with the section, rather than never loading it at all.
  const [isMapVisible, setIsMapVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const [isMapReady, setIsMapReady] = useState(false);

  const apiKey = import.meta.env.VITE_MAPTILER_KEY as string | undefined;
  const showMapFallback = !apiKey;

  const infoItems = useMemo(
    () => [
      {
        label: t("location.info.location.label"),
        value: t("location.info.location.value"),
      },
      {
        label: t("location.info.access.label"),
        value: t("location.info.access.value"),
      },
      {
        label: t("location.info.format.label"),
        value: t("location.info.format.value"),
      },
    ],
    [t],
  );

  // MapLibre is the single largest dependency in the bundle and this section
  // sits near the foot of the page, so the chunk is only requested once the
  // section is close to the viewport.
  useEffect(() => {
    if (!apiKey || isMapVisible) return;

    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsMapVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: MAP_PRELOAD_MARGIN },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [apiKey, isMapVisible]);

  return (
    <section id="location" className={styles.section} ref={sectionRef}>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <div className={styles.kicker}>{t("location.kicker")}</div>

            <h2 className={styles.title}>{t("location.title")}</h2>
            <p className={styles.description}>{t("location.description")}</p>

            <address className={styles.addressCard}>
              <span className={styles.addressLabel}>
                {t("location.addressLabel")}
              </span>
              <strong className={styles.addressText}>{STUDIO_ADDRESS}</strong>
              <span className={styles.addressMeta}>
                {t("location.addressMeta")}
              </span>
            </address>

            <div className={styles.infoGrid}>
              {infoItems.map((item) => (
                <div key={item.label} className={styles.infoItem}>
                  <span className={styles.infoItemLabel}>{item.label}</span>
                  <span className={styles.infoItemValue}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <a
                href={MAP_URL}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.primaryButton}
              >
                {t("location.primaryCta")}
              </a>

              <a href="#contact" className={styles.secondaryButton}>
                {t("location.secondaryCta")}
              </a>
            </div>
          </div>

          <div className={styles.mapShell}>
            <div className={styles.mapFrame}>
              <div className={styles.mapTopBar}>
                <div className={styles.mapTopBadge}>
                  {t("location.mapCard.kicker")}
                </div>
                <div className={styles.mapTopBadge}>Swarzędz // PL</div>
              </div>

              {apiKey && isMapVisible ? (
                // If the map chunk fails to load the section still shows the
                // address and directions rather than taking the page down.
                <ErrorBoundary
                  fallback={
                    <div className={styles.mapContainer} aria-hidden />
                  }
                >
                  <Suspense
                    fallback={
                      <div className={styles.mapContainer} aria-hidden />
                    }
                  >
                    <LocationMap
                      apiKey={apiKey}
                      onReady={() => setIsMapReady(true)}
                    />
                  </Suspense>
                </ErrorBoundary>
              ) : (
                <div className={styles.mapContainer} aria-hidden />
              )}

              <div className={styles.mapOverlay} />
              <div className={styles.mapNoise} />

              {showMapFallback && (
                <div className={styles.mapFallback}>
                  <span className={styles.mapFallbackLabel}>
                    {t("location.addressLabel")}
                  </span>
                  <p className={styles.mapFallbackText}>
                    {t("location.mapUnavailable")}
                  </p>
                </div>
              )}

              <div
                className={`${styles.mapCard} ${
                  isMapReady ? styles.mapCardReady : ""
                }`}
              >
                <span className={styles.mapCardKicker}>
                  {t("location.mapCard.kicker")}
                </span>
                <h3 className={styles.mapCardTitle}>
                  {t("location.mapCard.title")}
                </h3>
                <p className={styles.mapCardText}>
                  {t("location.mapCard.text")}
                </p>

                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.routeButton}
                >
                  {t("location.mapCard.link")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
