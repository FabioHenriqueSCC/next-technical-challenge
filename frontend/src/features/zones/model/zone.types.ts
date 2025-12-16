import type { ZoneGeometry } from './zone.geometry';

export const ZONE_TYPES = [
  'RESIDENCIAL',
  'COMERCIAL',
  'INDUSTRIAL',
  'MISTO',
  'ESPECIAL',
] as const;

export type ZoneType = (typeof ZONE_TYPES)[number];

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
