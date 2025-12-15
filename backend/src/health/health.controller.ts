import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

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
  health() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Returns OK if API can access the database.',
  })
  @ApiOkResponse({ example: { status: 'ok', db: 'ok' } })
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'ok' };
  }
}
