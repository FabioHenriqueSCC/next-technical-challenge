import { BadRequestException, Injectable } from '@nestjs/common';
import { Zone } from '@prisma/client';
import { CreateZoneDto } from './dto/create-zone.dto';
import { ZonesRepository } from './zones.repository';
import { isValidGeoJson } from '../common/utils/geojson';

@Injectable()
export class ZonesService {
  constructor(private readonly repo: ZonesRepository) {}

  async create(dto: CreateZoneDto): Promise<Zone> {
    if (!isValidGeoJson(dto.geometry)) {
      throw new BadRequestException(
        'geometry must be a valid GeoJSON Point or Polygon',
      );
    }

    return await this.repo.create({
      name: dto.name.trim(),
      type: dto.type,
      geometry: dto.geometry,
    });
  }

  async list(name?: string): Promise<Zone[]> {
    return await this.repo.findMany({
      where: name
        ? { name: { contains: name, mode: 'insensitive' } }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
