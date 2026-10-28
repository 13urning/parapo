import { PartialType } from '@nestjs/mapped-types';
import { MatrixStatus, VehicleType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const num = { allowNaN: false, allowInfinity: false };

export class CreateFareMatrixDto {
  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @IsNumber(num)
  @Min(1)
  @Max(200)
  baseFare!: number;

  @IsNumber(num)
  @Min(1)
  @Max(20)
  baseKm!: number;

  @IsNumber(num)
  @Min(0)
  @Max(50)
  perKmRate!: number;

  @IsNumber(num)
  @Min(0)
  @Max(100)
  discountPercent!: number;

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateFareMatrixDto extends PartialType(CreateFareMatrixDto) {}

export class ListMatricesQueryDto {
  @IsOptional()
  @IsEnum(MatrixStatus)
  status?: MatrixStatus;
}
