import { Injectable } from '@nestjs/common';
import { Prisma, Zone } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persists a new Zone record.
   *
   * @param data - Prisma create input.
   * @returns The created Zone row.
   */
  create(data: Prisma.ZoneCreateInput): Promise<Zone> {
    return this.prisma.zone.create({ data });
  }

  /**
   * Finds Zone records using optional Prisma filters.
   *
   * @param params - Query params (where/orderBy).
   * @returns Zone rows.
   */
  findMany(params: {
    where?: Prisma.ZoneWhereInput;
    orderBy?: Prisma.ZoneOrderByWithRelationInput;
  }): Promise<Zone[]> {
    return this.prisma.zone.findMany({
      where: params.where,
      orderBy: params.orderBy,
    });
  }
}
