import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateZoneDto } from './dto/create-zone.dto';
import { ZonesService } from './zones.service';

@ApiTags('zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly service: ZonesService) {}

  @Get()
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by name (contains)',
  })
  list(@Query('name') name?: string) {
    return this.service.list(name);
  }

  @Post()
  create(@Body() dto: CreateZoneDto) {
    return this.service.create(dto);
  }
}
