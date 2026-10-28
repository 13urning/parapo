import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { RequestGuard } from './common/request-guard';
import { ConfigModule } from './config/config.module';
import { FareMatricesModule } from './fare-matrices/fare-matrices.module';
import { FaresModule } from './fares/fares.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PlacesModule } from './places/places.module';
import { PrismaModule } from './prisma/prisma.module';
import { TripsModule } from './trips/trips.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    // Default per-IP limit. All browsers reach the API via the single web-proxy IP, so keep it generous.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    UsersModule,
    AuthModule,
    PlacesModule,
    FaresModule,
    TripsModule,
    FareMatricesModule,
    NotificationsModule,
    AnalyticsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RequestGuard },
  ],
})
export class AppModule {}
