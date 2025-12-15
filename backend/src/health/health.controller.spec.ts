import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;

  const prismaMock = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prismaMock }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
  });

  it('should return ok on /health', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
  });

  it('should return ok on /ready when db is reachable', async () => {
    prismaMock.$queryRaw.mockResolvedValue(1);

    const res = await controller.ready();

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ status: 'ok', db: 'ok' });
  });

  it('should throw 503 on /ready when db is not reachable', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('db down'));

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
