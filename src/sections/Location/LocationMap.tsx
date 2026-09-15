import { useEffect, useRef } from "react";
import maplibregl, { NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import styles from "./Location.module.css";
import { STUDIO_COORDS } from "./studio";

const INITIAL_VIEW = {
  center: STUDIO_COORDS,
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
    // Layer exists but does not accept this property; nothing to do.
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
    // Same as above — style schemas vary between MapTiler releases.
  }
}

function addTransparentPlaceholderImage(map: maplibregl.Map, id: string) {
  if (!id || map.hasImage(id)) return;

  map.addImage(id, {
    width: 1,
    height: 1,
    data: new Uint8Array([0, 0, 0, 0]),
  });
}

/** Tones the stock MapTiler dark style down to the site's own palette. */
function styleMapLayers(map: maplibregl.Map) {
  const layers = map.getStyle().layers ?? [];

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
        safeSetPaintProperty(
          map,
          id,
          "fill-color",
          lowerId.includes("park") ? "#0a0a0a" : "#070707",
        );
      }
    }

    if (isRoad && type === "line") {
      safeSetPaintProperty(map, id, "line-color", "rgba(255,255,255,0.18)");
      safeSetPaintProperty(map, id, "line-opacity", 0.95);
    }

    if (isMainRoad && type === "line") {
      safeSetPaintProperty(map, id, "line-color", "rgba(215,181,109,0.55)");
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

function createMarkerElement() {
  const markerEl = document.createElement("div");
  markerEl.className = styles.customMarker;
  markerEl.innerHTML = `
    <span class="${styles.markerOuter}"></span>
    <span class="${styles.markerPulse}"></span>
    <span class="${styles.markerCore}"></span>
  `;
  return markerEl;
}

type LocationMapProps = {
  apiKey: string;
  onReady: () => void;
};

/**
 * MapLibre is roughly 800 kB of the bundle and the map sits near the bottom of
 * the page, so this module is loaded lazily by the Location section once the
 * section approaches the viewport.
 */
export default function LocationMap({ apiKey, onReady }: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onReadyRef = useRef(onReady);

  // Kept in a ref so a changing callback identity never re-creates the map.
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (!apiKey || !mapContainerRef.current || mapRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

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

    map.addControl(
      new NavigationControl({ showCompass: false, visualizePitch: false }),
      "top-right",
    );

    map.on("styleimagemissing", (event) => {
      const rawId = event.id ?? "";
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

      markerRef.current = new maplibregl.Marker({
        element: createMarkerElement(),
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
        // Honor the OS reduced-motion setting rather than flying the camera.
        duration: prefersReducedMotion ? 0 : 1800,
      });

      onReadyRef.current();
    });

    map.on("error", (event) => {
      console.error("MapLibre error:", event);
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [apiKey]);

  return <div ref={mapContainerRef} className={styles.mapContainer} />;
}
