import { Test, TestingModule } from '@nestjs/testing';
import { ZonesController } from './zones.controller';
import { ZonesService } from './zones.service';
import { CreateZoneDto, ZoneTypeDto } from './dto/create-zone.dto';

describe('ZonesController', () => {
  let controller: ZonesController;

  const zonesServiceMock = {
    list: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZonesController],
      providers: [{ provide: ZonesService, useValue: zonesServiceMock }],
    }).compile();

    controller = module.get<ZonesController>(ZonesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.list', async () => {
    zonesServiceMock.list.mockResolvedValue([{ id: '1' }]);

    const res = await controller.list();

    expect(zonesServiceMock.list).toHaveBeenCalledTimes(1);
    expect(res).toHaveLength(1);
  });

  it('should call service.list with name filter', async () => {
    zonesServiceMock.list.mockResolvedValue([{ id: '1' }]);

    const res = await controller.list('resi');

    expect(zonesServiceMock.list).toHaveBeenCalledWith('resi');
    expect(res).toHaveLength(1);
  });

  it('should call service.create', async () => {
    zonesServiceMock.create.mockResolvedValue({ id: '1' });

    const dto: CreateZoneDto = {
      name: 'Zona Residencial Norte',
      type: ZoneTypeDto.RESIDENCIAL,
      geometry: { type: 'Point', coordinates: [-46.63, -23.55] },
    };

    const res = await controller.create(dto);

    expect(zonesServiceMock.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: '1' });
  });
});
