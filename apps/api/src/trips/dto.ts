import { VehicleType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const num = { allowNaN: false, allowInfinity: false };

export class CreateTripDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  originLabel!: string;

  @IsNumber(num)
  @Min(-90)
  @Max(90)
  originLat!: number;

  @IsNumber(num)
  @Min(-180)
  @Max(180)
  originLng!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  destLabel!: string;

  @IsNumber(num)
  @Min(-90)
  @Max(90)
  destLat!: number;

  @IsNumber(num)
  @Min(-180)
  @Max(180)
  destLng!: number;

  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @IsNumber(num)
  @Min(0.01)
  @Max(2000)
  distanceKm!: number;

  @IsBoolean()
  estimated!: boolean;
}
