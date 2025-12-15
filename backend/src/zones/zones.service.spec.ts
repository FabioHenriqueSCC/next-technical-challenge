import { Test, TestingModule } from '@nestjs/testing';
import { ZonesService } from './zones.service';
import { ZonesRepository } from './zones.repository';
import { CreateZoneDto, ZoneTypeDto } from './dto/create-zone.dto';

describe('ZonesService', () => {
  let service: ZonesService;

  const repoMock = {
    create: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZonesService,
        { provide: ZonesRepository, useValue: repoMock },
      ],
    }).compile();

    service = module.get<ZonesService>(ZonesService);
    jest.clearAllMocks();
  });

  it('should list zones', async () => {
    repoMock.findMany.mockResolvedValue([{ id: '1' }]);

    const res = await service.list();

    expect(res).toHaveLength(1);
    expect(repoMock.findMany).toHaveBeenCalledTimes(1);
  });

  it('should create a zone', async () => {
    repoMock.create.mockResolvedValue({ id: '1' });

    const dto: CreateZoneDto = {
      name: 'Zona Residencial Norte',
      type: ZoneTypeDto.RESIDENCIAL,
      geometry: { type: 'Point', coordinates: [-46.63, -23.55] },
    };

    const res = await service.create(dto);

    expect(repoMock.create).toHaveBeenCalledTimes(1);
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

  it('should reject polygon not closed', async () => {
    const dto: CreateZoneDto = {
      name: 'Zona Teste',
      type: ZoneTypeDto.COMERCIAL,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-46.64, -23.55],
            [-46.63, -23.55],
            [-46.63, -23.54],
            [-46.64, -23.54],
          ],
        ],
      },
    };

    await expect(service.create(dto)).rejects.toThrow();
  });
});
