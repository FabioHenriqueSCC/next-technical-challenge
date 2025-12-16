import { z } from 'zod';
import { ZONE_TYPES } from './zone.types';

const lngLatSchema = z.tuple([z.number(), z.number()]);

const pointSchema = z.object({
  type: z.literal('Point'),
  coordinates: lngLatSchema,
});

const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(lngLatSchema)).min(1),
});

export const createZoneSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  type: z.enum(ZONE_TYPES),
  geometry: z.union([pointSchema, polygonSchema]),
});

export type CreateZoneFormValues = z.infer<typeof createZoneSchema>;
