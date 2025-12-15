/**
 * Database seed script (development/demo only).
 *
 * @remarks
 * - Inserts deterministic sample zones (Point and Polygon).
 * - Uses `skipDuplicates` so it can be executed multiple times safely.
 * - Validates GeoJSON with the same rules used by the API.
 *
 * @example
 * npx prisma db seed
 */

import 'dotenv/config';
import { PrismaClient, ZoneType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { GeoJsonGeometry } from '../src/common/types/geojson';
import { isValidGeoJson } from '../src/common/utils/geojson';

/**
 * Creates a PrismaClient instance using the Prisma PostgreSQL adapter.
 *
 * @throws {Error} When DATABASE_URL is not configured.
 */
function prisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

/**
 * Executes the seed routine.
 *
 * @remarks
 * This function validates all geometries before inserting them into the database.
 */
async function main() {
  const client = prisma();

  const zones: Array<{
    id: string;
    name: string;
    type: ZoneType;
    geometry: GeoJsonGeometry;
  }> = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Zona Residencial Norte (Seed)',
      type: ZoneType.RESIDENCIAL,
      geometry: { type: 'Point', coordinates: [-46.6333, -23.5505] },
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Zona Comercial Central (Seed)',
      type: ZoneType.COMERCIAL,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-46.64, -23.55],
            [-46.63, -23.55],
            [-46.63, -23.54],
            [-46.64, -23.54],
            [-46.64, -23.55],
          ],
        ],
      },
    },
  ];

  for (const z of zones) {
    if (!isValidGeoJson(z.geometry)) {
      throw new Error(`Invalid GeoJSON in seed for zone: ${z.name}`);
    }
  }

  await client.zone.createMany({
    data: zones,
    skipDuplicates: true,
  });

  await client.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
