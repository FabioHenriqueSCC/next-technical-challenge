import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

type HealthResponse = { status: 'ok' };
type ReadyResponse = { status: 'ok'; db: 'ok' };

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Returns OK if the API process is running.',
  })
  @ApiOkResponse({ example: { status: 'ok' } })
  /**
   * Liveness probe.
   *
   * @returns Basic OK response if the API process is running.
   */
  health(): HealthResponse {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Returns OK if the API can access the database.',
  })
  @ApiOkResponse({ example: { status: 'ok', db: 'ok' } })
  @ApiServiceUnavailableResponse({
    description: 'Database is not reachable',
    example: {
      statusCode: 503,
      message: 'Database is not reachable',
      error: 'Service Unavailable',
    },
  })
  /**
   * Readiness probe.
   *
   * @returns OK if the database is reachable.
   * @throws {ServiceUnavailableException} When the database is not reachable.
   */
  async ready(): Promise<ReadyResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Database is not reachable');
    }
  }
}
