import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateFareMatrixDto, ListMatricesQueryDto, UpdateFareMatrixDto } from './dto';
import { FareMatricesService } from './fare-matrices.service';

@Controller('fare-matrices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FareMatricesController {
  constructor(private readonly matrices: FareMatricesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() q: ListMatricesQueryDto) {
    return this.matrices.list(user.role, q.status);
  }

  @Get(':id')
  @Roles('ADMIN')
  get(@Param('id') id: string) {
    return this.matrices.get(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateFareMatrixDto) {
    return this.matrices.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateFareMatrixDto) {
    return this.matrices.update(id, dto);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @Roles('ADMIN')
  publish(@Param('id') id: string) {
    return this.matrices.publish(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  async remove(@Param('id') id: string): Promise<void> {
    await this.matrices.remove(id);
  }
}
