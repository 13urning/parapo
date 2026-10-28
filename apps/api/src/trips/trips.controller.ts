import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PageQueryDto } from '../common/pagination';
import { CreateTripDto } from './dto';
import { TripsService } from './trips.service';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTripDto) {
    return this.trips.create(user.sub, dto);
  }

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() q: PageQueryDto) {
    return this.trips.list(user.sub, q.page, q.pageSize);
  }

  @Get('summary')
  summary(@CurrentUser() user: JwtPayload) {
    return this.trips.summary(user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    await this.trips.remove(user.sub, id);
  }
}
