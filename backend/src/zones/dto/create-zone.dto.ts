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
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsEnum(ZoneTypeDto)
  type!: ZoneTypeDto;

  @IsObject()
  geometry!: Record<string, unknown>;
}
