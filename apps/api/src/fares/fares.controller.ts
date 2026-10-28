import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FareCategory, VehicleType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FaresService } from './fares.service';

export class QuoteQueryDto {
  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.01)
  @Max(2000)
  distanceKm!: number;

  @IsOptional()
  @IsEnum(FareCategory)
  fareCategory?: FareCategory;
}

@Controller('fares')
@UseGuards(JwtAuthGuard)
export class FaresController {
  constructor(private readonly fares: FaresService) {}

  @Get('quote')
  quote(@CurrentUser() user: JwtPayload, @Query() q: QuoteQueryDto) {
    return this.fares.quoteForUser(
      user.sub,
      q.vehicleType,
      Math.round(q.distanceKm * 100) / 100,
      q.fareCategory,
    );
  }
}
