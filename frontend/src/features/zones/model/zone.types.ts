import type { Geometry } from 'geojson';

export type ZoneType = 'RESIDENCIAL' | 'COMERCIAL' | 'INDUSTRIAL' | 'MISTO';

export type Zone = {
  id: string;
  name: string;
  type: ZoneType;
  geometry: Geometry;
  createdAt: string;
};

export type CreateZoneDTO = {
  name: string;
  type: ZoneType;
  geometry: Geometry;
};
