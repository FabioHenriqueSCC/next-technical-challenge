import type { GeoJsonGeometry, Position } from '../types/geojson';

/**
 * Checks whether a value is a non-null object (record-like).
 *
 * @param value - Any value.
 * @returns True if the value is an object and not null.
 */
function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Checks whether a value is a finite number.
 *
 * @param value - Any value.
 * @returns True if value is a finite number.
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Checks whether a value is a GeoJSON Position tuple ([lng, lat]).
 *
 * @param value - Any value.
 * @returns True if the value is a [number, number] tuple.
 */
function isPosition(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isNumber(value[0]) &&
    isNumber(value[1])
  );
}

/**
 * Checks whether a polygon ring is closed and has the minimum number of points.
 *
 * @remarks
 * A valid linear ring must have at least 4 positions (first equals last).
 *
 * @param ring - Ring positions.
 * @returns True if the ring is closed and has at least 4 positions.
 */
function isClosedRing(ring: Position[]): boolean {
  if (ring.length < 4) return false;

  const first = ring[0];
  const last = ring[ring.length - 1];

  return first[0] === last[0] && first[1] === last[1];
}

/**
 * Checks whether a value matches GeoJSON Polygon coordinates.
 *
 * @remarks
 * This validator enforces:
 * - coordinates is Position[][]
 * - each ring has valid positions
 * - each ring is closed
 *
 * @param value - Any value.
 * @returns True if the value is Polygon coordinates.
 */
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
 * Validates the subset of GeoJSON geometry supported by this project: Point and Polygon.
 *
 * @param geometry - Unknown value from input payload.
 * @returns True if geometry is a valid GeoJSON Point or Polygon.
 *
 * @example
 * isValidGeoJson({ type: "Point", coordinates: [-46.63, -23.55] }) // true
 *
 * @example
 * isValidGeoJson({
 *   type: "Polygon",
 *   coordinates: [[
 *     [-46.64, -23.55],
 *     [-46.63, -23.55],
 *     [-46.63, -23.54],
 *     [-46.64, -23.54],
 *     [-46.64, -23.55],
 *   ]]
 * }) // true
 */
export function isValidGeoJson(geometry: unknown): geometry is GeoJsonGeometry {
  if (!isObjectRecord(geometry)) return false;

  const type = geometry.type;
  const coordinates = geometry.coordinates;

  if (type === 'Point') return isPosition(coordinates);
  if (type === 'Polygon') return isPolygonCoordinates(coordinates);

  return false;
}
