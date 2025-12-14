type Position = [number, number];

export type GeoJsonPoint = {
  type: 'Point';
  coordinates: Position;
};

export type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: Position[][];
};

export type GeoJsonGeometry = GeoJsonPoint | GeoJsonPolygon;

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

function isPolygonCoordinates(value: unknown): value is Position[][] {
  return (
    Array.isArray(value) &&
    value.every(
      (ring) => Array.isArray(ring) && ring.every((pos) => isPosition(pos)),
    )
  );
}

/**
 * Validates a minimal subset of GeoJSON geometry supported by the challenge:
 * Point and Polygon.
 */
export function isValidGeoJson(geometry: unknown): geometry is GeoJsonGeometry {
  if (!isObjectRecord(geometry)) return false;

  const type = geometry.type;
  const coordinates = geometry.coordinates;

  if (type === 'Point') {
    return isPosition(coordinates);
  }

  if (type === 'Polygon') {
    return isPolygonCoordinates(coordinates);
  }

  return false;
}
