import { Test, TestingModule } from '@nestjs/testing';
import { ZonesService } from './zones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateZoneDto, ZoneTypeDto } from './dto/create-zone.dto';

describe('ZonesService', () => {
  let service: ZonesService;

  const prismaMock = {
    zone: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZonesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ZonesService>(ZonesService);
    jest.clearAllMocks();
  });

  it('should list zones', async () => {
    prismaMock.zone.findMany.mockResolvedValue([{ id: '1' }]);

    const res = await service.list();

    expect(res).toHaveLength(1);
  });

  it('should create a zone', async () => {
    prismaMock.zone.create.mockResolvedValue({ id: '1' });

    const dto: CreateZoneDto = {
      name: 'Zona Residencial Norte',
      type: ZoneTypeDto.RESIDENCIAL,
      geometry: { type: 'Point', coordinates: [-46.63, -23.55] },
    };

    const res = await service.create(dto);

    expect(res).toEqual({ id: '1' });
  });

  it('should reject invalid geometry', async () => {
    const dto: CreateZoneDto = {
      name: 'X',
      type: ZoneTypeDto.RESIDENCIAL,
      geometry: { foo: 'bar' },
    };

    await expect(service.create(dto)).rejects.toThrow();
  });
});
