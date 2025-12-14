export type LngLat = [number, number];

export type Point2D = {
  type: 'Point';
  coordinates: LngLat;
};

export type Polygon2D = {
  type: 'Polygon';
  coordinates: LngLat[][];
};

export type ZoneGeometry = Point2D | Polygon2D;
