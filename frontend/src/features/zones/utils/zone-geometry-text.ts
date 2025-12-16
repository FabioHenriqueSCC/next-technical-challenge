import type { ZoneGeometry } from '../model/zone.geometry';

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

export function zoneGeometryToPrettyJson(g: ZoneGeometry | null): string {
  if (!g) return '';
  return JSON.stringify(g, null, 2);
}
