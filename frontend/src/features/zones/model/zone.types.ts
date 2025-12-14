import type { ZoneGeometry } from './zone.geometry';

export type ZoneType =
  | 'RESIDENCIAL'
  | 'COMERCIAL'
  | 'INDUSTRIAL'
  | 'MISTO'
  | 'ESPECIAL';

export type Zone = {
  id: string;
  name: string;
  type: ZoneType;
  geometry: ZoneGeometry;
  createdAt: string;
};

export type CreateZoneDTO = {
  name: string;
  type: ZoneType;
  geometry: ZoneGeometry;
};
