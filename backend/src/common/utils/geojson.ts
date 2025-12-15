import type { GeoJsonGeometry, Position } from '../types/geojson';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPosition(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isNumber(value[0]) &&
    isNumber(value[1])
  );
}

function isClosedRing(ring: Position[]): boolean {
  if (ring.length < 4) return false;

  const first = ring[0];
  const last = ring[ring.length - 1];

  return first[0] === last[0] && first[1] === last[1];
}

function isPolygonCoordinates(value: unknown): value is Position[][] {
  if (!Array.isArray(value)) return false;

  return value.every((ring) => {
    if (!Array.isArray(ring)) return false;

    const positions = ring as unknown[];
    if (!positions.every((pos) => isPosition(pos))) return false;

    return isClosedRing(positions);
  });
}

/**
 * Validates a minimal subset of GeoJSON geometry supported by this project:
 * Point and Polygon (closed ring, at least 4 positions).
 */
export function isValidGeoJson(geometry: unknown): geometry is GeoJsonGeometry {
  if (!isObjectRecord(geometry)) return false;

  const type = geometry.type;
  const coordinates = geometry.coordinates;

  if (type === 'Point') return isPosition(coordinates);
  if (type === 'Polygon') return isPolygonCoordinates(coordinates);

  return false;
}
