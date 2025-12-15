/**
 * Minimal GeoJSON types used by this project.
 *
 * @remarks
 * Coordinates follow `[lng, lat]` order.
 */

export type Position = [number, number];

export type GeoJsonPoint = {
  type: 'Point';
  coordinates: Position;
};

export type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: Position[][];
};

export type GeoJsonGeometry = GeoJsonPoint | GeoJsonPolygon;
