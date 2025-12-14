import { BadRequestException, Injectable } from '@nestjs/common';
import { Zone } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { isValidGeoJson } from './geojson';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateZoneDto): Promise<Zone> {
    if (!isValidGeoJson(dto.geometry)) {
      throw new BadRequestException(
        'geometry must be a valid GeoJSON Point or Polygon',
      );
    }

    const zone = await this.prisma.zone.create({
      data: {
        name: dto.name.trim(),
        type: dto.type,
        geometry: dto.geometry,
      },
    });

    return zone;
  }

  async list(name?: string): Promise<Zone[]> {
    const zones = await this.prisma.zone.findMany({
      where: name
        ? { name: { contains: name, mode: 'insensitive' } }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return zones;
  }
}
