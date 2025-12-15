import { Injectable } from '@nestjs/common';
import { Prisma, Zone } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ZoneCreateInput): Promise<Zone> {
    return this.prisma.zone.create({ data });
  }

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
