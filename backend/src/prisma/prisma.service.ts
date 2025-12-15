import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Creates a PrismaClient using the Prisma PostgreSQL adapter.
   *
   * @param config - Nest ConfigService used to access DATABASE_URL.
   * @throws {Error} When DATABASE_URL is not configured.
   */
  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    if (!connectionString) throw new Error('DATABASE_URL is not set');

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  /**
   * Establishes the database connection when the module is initialized.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Closes the database connection when the module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
