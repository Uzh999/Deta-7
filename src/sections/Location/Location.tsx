import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import maplibregl, { NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import Container from "../../components/layout/Container";
import styles from "./Location.module.css";

const mapUrl =
  "https://www.google.com/maps?q=Miko%C5%82aja%20Reja%2013%2C%2062-020%20Swarz%C4%99dz%2C%20Poland";

const STUDIO_COORDS: [number, number] = [17.0717, 52.4078];

const INITIAL_VIEW = {
  center: [17.0625, 52.4108] as [number, number],
  zoom: 13.4,
  pitch: 30,
  bearing: -18,
};

const FINAL_VIEW = {
  zoom: 14.15,
  pitch: 28,
  bearing: -16,
};

function buildMapTilerStyleUrl(apiKey: string) {
  return `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${apiKey}`;
}

function safeSetLayoutVisibility(
  map: maplibregl.Map,
  layerId: string,
  visibility: "visible" | "none",
) {
  if (!map.getLayer(layerId)) return;

  try {
    map.setLayoutProperty(layerId, "visibility", visibility);
  } catch {
    // ignore
  }
}

function safeSetPaintProperty(
  map: maplibregl.Map,
  layerId: string,
  property: string,
  value: unknown,
) {
  if (!map.getLayer(layerId)) return;

  try {
    map.setPaintProperty(layerId, property, value as never);
  } catch {
    // ignore
  }
}

function addTransparentPlaceholderImage(map: maplibregl.Map, id: string) {
  if (!id || map.hasImage(id)) return;

  const transparentPixel = new Uint8Array([0, 0, 0, 0]);

  map.addImage(id, {
    width: 1,
    height: 1,
    data: transparentPixel,
  });
}

function styleMapLayers(map: maplibregl.Map) {
  const style = map.getStyle();
  const layers = style.layers ?? [];

  layers.forEach((layer) => {
    const id = layer.id;
    const type = layer.type;
    const lowerId = id.toLowerCase();

    const isPoi =
      lowerId.includes("poi") ||
      lowerId.includes("transit") ||
      lowerId.includes("rail") ||
      lowerId.includes("airport") ||
      lowerId.includes("aerodrome");

    const isRoad =
      lowerId.includes("road") ||
      lowerId.includes("street") ||
      lowerId.includes("transportation");

    const isMainRoad =
      lowerId.includes("motorway") ||
      lowerId.includes("trunk") ||
      lowerId.includes("primary");

    const isWater = lowerId.includes("water");
    const isLand =
      lowerId.includes("land") ||
      lowerId.includes("background") ||
      lowerId.includes("park");

    if (isPoi) {
      safeSetLayoutVisibility(map, id, "none");
      return;
    }

    if (type === "symbol") {
      safeSetPaintProperty(map, id, "text-color", "rgba(255,255,255,0.28)");
      safeSetPaintProperty(map, id, "text-halo-color", "rgba(0,0,0,0)");
      safeSetPaintProperty(map, id, "text-opacity", 0.72);
      safeSetPaintProperty(map, id, "icon-opacity", 0);

      if (
        lowerId.includes("poi") ||
        lowerId.includes("icon") ||
        lowerId.includes("parking") ||
        lowerId.includes("amenity") ||
        lowerId.includes("shop") ||
        lowerId.includes("office") ||
        lowerId.includes("business") ||
        lowerId.includes("commercial")
      ) {
        safeSetLayoutVisibility(map, id, "none");
      }
    }

    if (isWater) {
      if (type === "fill") {
        safeSetPaintProperty(map, id, "fill-color", "#0b0f14");
      }
      if (type === "line") {
        safeSetPaintProperty(map, id, "line-color", "rgba(255,255,255,0.08)");
      }
    }

    if (isLand) {
      if (type === "background") {
        safeSetPaintProperty(map, id, "background-color", "#070707");
      }
      if (type === "fill") {
        if (lowerId.includes("park")) {
          safeSetPaintProperty(map, id, "fill-color", "#0a0a0a");
        } else {
          safeSetPaintProperty(map, id, "fill-color", "#070707");
        }
      }
    }

    if (isRoad && type === "line") {
      safeSetPaintProperty(map, id, "line-color", "rgba(255,255,255,0.18)");
      safeSetPaintProperty(map, id, "line-opacity", 0.95);
    }

    if (isMainRoad && type === "line") {
      safeSetPaintProperty(map, id, "line-color", "rgba(212,175,55,0.55)");
      safeSetPaintProperty(map, id, "line-opacity", 0.95);
    }

    if (lowerId.includes("building")) {
      if (type === "fill") {
        safeSetPaintProperty(map, id, "fill-color", "rgba(255,255,255,0.05)");
        safeSetPaintProperty(map, id, "fill-opacity", 0.35);
      }
      if (type === "line") {
        safeSetPaintProperty(map, id, "line-color", "rgba(255,255,255,0.08)");
      }
    }
  });
}

function createMarkerElement(classNames: {
  customMarker: string;
  markerOuter: string;
  markerPulse: string;
  markerCore: string;
}) {
  const markerEl = document.createElement("div");
  markerEl.className = classNames.customMarker;
  markerEl.innerHTML = `
    <span class="${classNames.markerOuter}"></span>
    <span class="${classNames.markerPulse}"></span>
    <span class="${classNames.markerCore}"></span>
  `;
  return markerEl;
}

export default function Location() {
  const { t } = useTranslation();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);

  const apiKey = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

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

  useEffect(() => {
    if (!apiKey || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: buildMapTilerStyleUrl(apiKey),
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      attributionControl: false,
    });

    mapRef.current = map;

    const navigationControl = new NavigationControl({
      showCompass: false,
      visualizePitch: false,
    });

    map.addControl(navigationControl, "top-right");

    map.on("styleimagemissing", (e) => {
      const rawId = e.id ?? "";
      const trimmedId = rawId.trim();

      if (!trimmedId) {
        addTransparentPlaceholderImage(map, rawId);
        return;
      }

      if (
        trimmedId === "office" ||
        trimmedId.includes("office") ||
        trimmedId.includes("amenity") ||
        trimmedId.includes("parking") ||
        trimmedId.includes("shop") ||
        trimmedId.includes("business")
      ) {
        addTransparentPlaceholderImage(map, trimmedId);
      }
    });

    map.on("load", () => {
      styleMapLayers(map);

      const markerEl = createMarkerElement({
        customMarker: styles.customMarker,
        markerOuter: styles.markerOuter,
        markerPulse: styles.markerPulse,
        markerCore: styles.markerCore,
      });

      markerRef.current = new maplibregl.Marker({
        element: markerEl,
        anchor: "center",
      })
        .setLngLat(STUDIO_COORDS)
        .addTo(map);

      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      map.easeTo({
        center: STUDIO_COORDS,
        zoom: isMobile ? 14 : FINAL_VIEW.zoom,
        pitch: isMobile ? 22 : FINAL_VIEW.pitch,
        bearing: FINAL_VIEW.bearing,
        offset: [0, isMobile ? -110 : -190],
        duration: 1800,
      });

      setMapReady(true);
    });

    map.on("error", (event) => {
      console.error("MapLibre error:", event);
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;

      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [apiKey]);

  const showMapFallback = !apiKey;

  return (
    <section id="location" className={styles.section}>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <div className={styles.kicker}>{t("location.kicker")}</div>

            <h2 className={styles.title}>{t("location.title")}</h2>
            <p className={styles.description}>{t("location.description")}</p>

            <div className={styles.addressCard}>
              <span className={styles.addressLabel}>
                {t("location.addressLabel")}
              </span>
              <strong className={styles.addressText}>
                Mikołaja Reja 13, 62-020 Swarzędz, Poland
              </strong>
              <span className={styles.addressMeta}>
                {t("location.addressMeta")}
              </span>
            </div>

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
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
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

              <div
                ref={mapContainerRef}
                className={styles.mapContainer}
                aria-hidden={showMapFallback}
              />

              <div className={styles.mapOverlay} />
              <div className={styles.mapNoise} />

              {showMapFallback && (
                <div className={styles.mapFallback}>
                  <span className={styles.mapFallbackLabel}>
                    Map unavailable
                  </span>
                  <p className={styles.mapFallbackText}>
                    Добавь VITE_MAPTILER_KEY в .env, чтобы загрузить карту.
                  </p>
                </div>
              )}

              <div
                className={`${styles.mapCard} ${
                  mapReady ? styles.mapCardReady : ""
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
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
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
