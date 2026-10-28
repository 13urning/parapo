import { Module } from '@nestjs/common';
import { FaresModule } from '../fares/fares.module';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({ imports: [FaresModule], controllers: [TripsController], providers: [TripsService] })
export class TripsModule {}
