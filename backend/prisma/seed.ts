import 'dotenv/config';
import { PrismaClient, ZoneType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

type Position = [number, number];

type GeoJsonPoint = {
  type: 'Point';
  coordinates: Position;
};

type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: Position[][];
};

type GeoJsonGeometry = GeoJsonPoint | GeoJsonPolygon;

function prisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

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
