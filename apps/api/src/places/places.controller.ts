import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlacesService } from './places.service';

const coord = { allowNaN: false, allowInfinity: false };

export class SearchQueryDto {
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(3)
  @MaxLength(200)
  q!: string;
}

export class RouteQueryDto {
  @Type(() => Number)
  @IsNumber(coord)
  @Min(-90)
  @Max(90)
  fromLat!: number;

  @Type(() => Number)
  @IsNumber(coord)
  @Min(-180)
  @Max(180)
  fromLng!: number;

  @Type(() => Number)
  @IsNumber(coord)
  @Min(-90)
  @Max(90)
  toLat!: number;

  @Type(() => Number)
  @IsNumber(coord)
  @Min(-180)
  @Max(180)
  toLng!: number;
}

@Controller('places')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get('search')
  search(@Query() q: SearchQueryDto) {
    return this.places.search(q.q);
  }

  @Get('route')
  route(@Query() q: RouteQueryDto) {
    return this.places.route([q.fromLat, q.fromLng], [q.toLat, q.toLng]);
  }
}
