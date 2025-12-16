import L from 'leaflet';
import type { ZoneGeometry } from '../../model/zone.geometry';
import type { LngLat } from '../../model/zone.geometry';

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const APPLY_POINT_MIN_ZOOM = 8;

export const APPLY_MAX_ZOOM = 8;

export const SELECT_POINT_MIN_ZOOM = 13;

export const SELECT_MAX_ZOOM = 15;

/**
 * Converts an application coordinate tuple `[lng, lat]` into a Leaflet tuple `[lat, lng]`.
 *
 * Leaflet APIs typically expect `[lat, lng]` while GeoJSON uses `[lng, lat]`.
 *
 * @param coord - Coordinate in `[lng, lat]` order.
 * @returns Tuple in `[lat, lng]` order.
 */
export const toLatLngTuple = (coord: LngLat): [number, number] => {
  const [lng, lat] = coord;
  return [lat, lng];
};

/**
 * Converts an application coordinate tuple `[lng, lat]` into a Leaflet `L.LatLng`.
 *
 * @param coord - Coordinate in `[lng, lat]` order.
 * @returns Leaflet LatLng instance.
 */
export const toLeafletLatLng = (coord: LngLat): L.LatLng => {
  const [lng, lat] = coord;
  return L.latLng(lat, lng);
};

/**
 * Converts a Leaflet `L.LatLng` into an application coordinate tuple `[lng, lat]`.
 *
 * @param ll - Leaflet LatLng instance.
 * @returns Coordinate in `[lng, lat]` order (GeoJSON-style).
 */
export const toLngLat = (ll: L.LatLng): LngLat => [ll.lng, ll.lat];

/**
 * Ensures a polygon ring is closed by repeating the first coordinate at the end.
 *
 * GeoJSON linear rings are typically expected to be closed (first = last).
 * If the ring is already closed, it is returned unchanged.
 *
 * @param coords - Ring coordinates in `[lng, lat]` order.
 * @returns A closed ring (may be the same reference if already closed).
 */
export function ensureClosedRing(coords: LngLat[]): LngLat[] {
  if (coords.length < 3) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return coords;
  return [...coords, first];
}

/**
 * Computes a Leaflet bounds object for a given `ZoneGeometry`.
 *
 * - For `Point`, it returns a small padded bounds around the point (so the map can "fit"
 *   without zooming too aggressively).
 * - For `Polygon`, it returns the bounds of the polygon's first ring.
 *
 * @param geometry - Zone geometry in application format.
 * @returns Leaflet LatLngBounds for fitting the map view.
 */
export function boundsFromGeometry(geometry: ZoneGeometry): L.LatLngBounds {
  if (geometry.type === 'Point') {
    const [lat, lng] = toLatLngTuple(geometry.coordinates);
    return L.latLngBounds(
      [lat - 0.002, lng - 0.002],
      [lat + 0.002, lng + 0.002],
    );
  }

  const ring = geometry.coordinates[0];
  const latLngs = ring.map((c) => {
    const [lat, lng] = toLatLngTuple(c);
    return L.latLng(lat, lng);
  });

  return L.latLngBounds(latLngs);
}
