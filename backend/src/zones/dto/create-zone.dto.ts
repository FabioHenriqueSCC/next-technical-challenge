import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
} from 'class-validator';

export enum ZoneTypeDto {
  RESIDENCIAL = 'RESIDENCIAL',
  COMERCIAL = 'COMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  MISTO = 'MISTO',
  ESPECIAL = 'ESPECIAL',
}

export class CreateZoneDto {
  @ApiProperty({
    example: 'Zona Residencial Norte',
    description: 'Zone name',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    enum: ZoneTypeDto,
    example: ZoneTypeDto.RESIDENCIAL,
    description: 'Zone type',
  })
  @IsEnum(ZoneTypeDto)
  type!: ZoneTypeDto;

  @ApiProperty({
    description:
      'GeoJSON geometry (Point or Polygon). Coordinates use [lng, lat].',
    examples: {
      point: {
        summary: 'Point',
        value: { type: 'Point', coordinates: [-46.6333, -23.5505] },
      },
      polygon: {
        summary: 'Polygon',
        value: {
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
  })
  @IsObject()
  geometry!: Record<string, unknown>;
}
