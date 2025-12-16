import type { ZoneGeometry } from '../model/zone.geometry';

/**
 * Parses a JSON string into an application `ZoneGeometry`.
 *
 * This helper is intended for text inputs (e.g., debug fields / advanced inputs)
 * where the user can paste a GeoJSON-like geometry object.
 *
 * Supported shapes:
 * - `{ type: "Point", coordinates: [lng, lat] }`
 * - `{ type: "Polygon", coordinates: [ [ [lng, lat], ... ] ] }` (reads only the first ring)
 *
 * Notes:
 * - Returns `null` for empty input or unsupported/invalid shapes.
 * - Throws if `input` is not valid JSON (because `JSON.parse` is not wrapped).
 *
 * @param input - Raw JSON text.
 * @returns A `ZoneGeometry` when valid; otherwise `null`.
 */
export function parseZoneGeometryJson(input: string): ZoneGeometry | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const raw = JSON.parse(trimmed) as unknown;

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'type' in raw &&
    (raw as { type?: unknown }).type === 'Point' &&
    'coordinates' in raw
  ) {
    const coords = (raw as { coordinates?: unknown }).coordinates;
    if (
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords.every((n) => typeof n === 'number')
    ) {
      return { type: 'Point', coordinates: [coords[0], coords[1]] };
    }
  }

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'type' in raw &&
    (raw as { type?: unknown }).type === 'Polygon' &&
    'coordinates' in raw
  ) {
    const coords = (raw as { coordinates?: unknown }).coordinates;

    if (
      Array.isArray(coords) &&
      coords.length >= 1 &&
      Array.isArray(coords[0]) &&
      (coords[0] as unknown[]).every(
        (p) =>
          Array.isArray(p) &&
          p.length === 2 &&
          p.every((n) => typeof n === 'number'),
      )
    ) {
      return {
        type: 'Polygon',
        coordinates: [coords[0] as Array<[number, number]>],
      };
    }
  }

  return null;
}

/**
 * Serializes a `ZoneGeometry` to a pretty-printed JSON string.
 * Useful for rendering geometry in textareas/debug views.
 *
 * @param g - Zone geometry (or `null`).
 * @returns Pretty JSON when `g` is provided; otherwise an empty string.
 */
export function zoneGeometryToPrettyJson(g: ZoneGeometry | null): string {
  if (!g) return '';
  return JSON.stringify(g, null, 2);
}
