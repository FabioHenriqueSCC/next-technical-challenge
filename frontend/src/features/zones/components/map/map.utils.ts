import L from 'leaflet';
import type { ZoneGeometry } from '../../model/zone.geometry';
import type { LngLat } from '../../model/zone.geometry';

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const APPLY_POINT_MIN_ZOOM = 8;
export const APPLY_MAX_ZOOM = 8;

export const SELECT_POINT_MIN_ZOOM = 13;
export const SELECT_MAX_ZOOM = 15;

export const toLatLngTuple = (coord: LngLat): [number, number] => {
  const [lng, lat] = coord;
  return [lat, lng];
};

export const toLeafletLatLng = (coord: LngLat): L.LatLng => {
  const [lng, lat] = coord;
  return L.latLng(lat, lng);
};

export const toLngLat = (ll: L.LatLng): LngLat => [ll.lng, ll.lat];

export function ensureClosedRing(coords: LngLat[]): LngLat[] {
  if (coords.length < 3) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return coords;
  return [...coords, first];
}

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
