import { z } from 'zod';

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
  type: z.enum(['RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'MISTO', 'ESPECIAL']),
  geometry: z.union([pointSchema, polygonSchema]),
});

export type CreateZoneFormValues = z.infer<typeof createZoneSchema>;
