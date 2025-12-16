import type { Geometry, Position } from 'geojson';
import type { LngLat, ZoneGeometry } from './zone.geometry';

function toLngLat(pos: Position): LngLat | null {
  if (!Array.isArray(pos) || pos.length < 2) return null;

  const lng = pos[0];
  const lat = pos[1];

  if (typeof lng !== 'number' || typeof lat !== 'number') return null;
  return [lng, lat];
}

export function normalizeToZoneGeometry(g: Geometry): ZoneGeometry | null {
  if (g.type === 'Point') {
    const ll = toLngLat(g.coordinates);
    if (!ll) return null;
    return { type: 'Point', coordinates: ll };
  }

  if (g.type === 'Polygon') {
    const rings = g.coordinates;
    const out: LngLat[][] = [];

    for (const ring of rings) {
      const ringOut: LngLat[] = [];

      for (const pos of ring) {
        const ll = toLngLat(pos);
        if (!ll) return null;
        ringOut.push(ll);
      }

      out.push(ringOut);
    }

    return { type: 'Polygon', coordinates: out };
  }

  return null;
}
