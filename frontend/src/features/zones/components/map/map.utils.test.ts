import type { LngLat } from '../../model/zone.geometry';
import { ensureClosedRing, toLatLngTuple } from './map.utils';

describe('map.utils', () => {
  it('toLatLngTuple converts [lng, lat] -> [lat, lng]', () => {
    expect(toLatLngTuple([-46.64, -23.55])).toEqual([-23.55, -46.64]);
  });

  it('ensureClosedRing appends first point when ring is not closed', () => {
    const ring: LngLat[] = [
      [-46.64, -23.55],
      [-46.63, -23.55],
      [-46.63, -23.54],
    ];

    const out = ensureClosedRing([...ring]);
    expect(out[out.length - 1]).toEqual(out[0]);
  });

  it('ensureClosedRing keeps ring unchanged when already closed', () => {
    const ring: LngLat[] = [
      [-46.64, -23.55],
      [-46.63, -23.55],
      [-46.63, -23.54],
      [-46.64, -23.55],
    ];

    const out = ensureClosedRing([...ring]);
    expect(out).toEqual(ring);
  });
});
