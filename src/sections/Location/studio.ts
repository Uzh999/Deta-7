/** Studio position and address, shared by the section and the map module. */
export const STUDIO_COORDS: [number, number] = [17.0747, 52.4039];

export const STUDIO_ADDRESS = "Mikołaja Reja 13, 62-020 Swarzędz, Poland";

/** Renders coordinates the way a map annotation would: 52.4039° N · 17.0747° E */
export function formatCoordinates([lng, lat]: [number, number]): string {
  const lateral = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
  const longitudinal = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;

  return `${lateral} · ${longitudinal}`;
}
