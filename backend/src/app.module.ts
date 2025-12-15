import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ZonesModule } from './zones/zones.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ZonesModule,
    HealthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
