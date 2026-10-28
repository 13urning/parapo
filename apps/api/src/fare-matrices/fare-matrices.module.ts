import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { FareMatricesController } from './fare-matrices.controller';
import { FareMatricesService } from './fare-matrices.service';

@Module({
  imports: [NotificationsModule],
  controllers: [FareMatricesController],
  providers: [FareMatricesService],
})
export class FareMatricesModule {}
