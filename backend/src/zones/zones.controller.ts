import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateZoneDto } from './dto/create-zone.dto';
import { ZonesService } from './zones.service';

@ApiTags('zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly service: ZonesService) {}

  @Get()
  @ApiOperation({
    summary: 'List zones',
    description: 'Returns all zones (optionally filtered by name).',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by name (contains, case-insensitive)',
    example: 'residencial',
  })
  @ApiOkResponse({
    description: 'Zones list',
    example: [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Zona Residencial Norte',
        type: 'RESIDENCIAL',
        geometry: { type: 'Point', coordinates: [-46.6333, -23.5505] },
        createdAt: '2025-12-13T05:02:51.455Z',
      },
    ],
  })
  /**
   * Lists zones optionally filtered by name.
   */
  list(@Query('name') name?: string) {
    return this.service.list(name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create zone',
    description: 'Creates a new zone with GeoJSON Point or Polygon.',
  })
  @ApiBody({
    type: CreateZoneDto,
    examples: {
      point: {
        summary: 'Create zone (Point)',
        value: {
          name: 'Zona Residencial Norte',
          type: 'RESIDENCIAL',
          geometry: { type: 'Point', coordinates: [-46.6333, -23.5505] },
        },
      },
      polygon: {
        summary: 'Create zone (Polygon)',
        value: {
          name: 'Zona Comercial Central',
          type: 'COMERCIAL',
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
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Zone created',
    example: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Zona Residencial Norte',
      type: 'RESIDENCIAL',
      geometry: { type: 'Point', coordinates: [-46.6333, -23.5505] },
      createdAt: '2025-12-13T05:02:51.455Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    example: {
      statusCode: 400,
      message: ['name should not be empty'],
      error: 'Bad Request',
    },
  })
  /**
   * Creates a new zone.
   */
  create(@Body() dto: CreateZoneDto) {
    return this.service.create(dto);
  }
}
