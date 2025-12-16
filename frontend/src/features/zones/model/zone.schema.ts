import { z } from 'zod';

/**
 * A GeoJSON coordinate pair in `[longitude, latitude]` order.
 * Note: GeoJSON uses `[lng, lat]` (not `[lat, lng]`).
 */
const lngLatSchema = z.tuple([z.number(), z.number()]);

/**
 * Minimal GeoJSON Point schema used by the application.
 * - `coordinates` must follow `[lng, lat]`.
 */
const pointSchema = z.object({
  type: z.literal('Point'),
  coordinates: lngLatSchema,
});

/**
 * Minimal GeoJSON Polygon schema used by the application.
 * - `coordinates` is an array of linear rings.
 * - Each ring is an array of positions (`[lng, lat]`).
 * - `.min(1)` enforces at least one ring.
 *
 * Note: This schema does not enforce "closed rings" (first = last),
 * which is sometimes handled by drawing tools or backend validation.
 */
const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(lngLatSchema)).min(1),
});

/**
 * Runtime validation schema for creating a Zone.
 * Used to validate payloads from forms and/or API before sending.
 */
export const createZoneSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  type: z.enum(['RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'MISTO', 'ESPECIAL']),
  geometry: z.union([pointSchema, polygonSchema]),
});

/**
 * Form-specific schema for creating a Zone.
 * Differs from `createZoneSchema` because `geometry` can be `null`
 * while the user has not drawn/selected anything yet.
 */
export const createZoneFormSchema = createZoneSchema.extend({
  geometry: createZoneSchema.shape.geometry.nullable(),
});

/**
 * TypeScript type inferred from `createZoneFormSchema`.
 * Represents the values produced/consumed by the Zone creation form.
 */
export type CreateZoneFormValues = z.infer<typeof createZoneFormSchema>;
