import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { SESSION_COOKIE } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TokenService } from '../auth/token.service';
import { AnalyticsService } from './analytics.service';
import { PageviewDto, SummaryQueryDto } from './dto';

@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly analytics: AnalyticsService,
    private readonly tokens: TokenService,
  ) {}

  @Post('pageview')
  @HttpCode(204)
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async pageview(@Body() dto: PageviewDto, @Req() req: Request): Promise<void> {
    // Lenient: an invalid/expired/missing cookie simply means an anonymous view.
    const cookies = req.cookies as Record<string, string | undefined> | undefined;
    const payload = await this.tokens.verify(cookies?.[SESSION_COOKIE]);
    try {
      await this.analytics.record(dto.path, payload?.sub ?? null);
    } catch (e) {
      // Analytics must never break the client.
      this.logger.error(`Failed to record pageview: ${(e as Error).message}`);
    }
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  summary(@Query() q: SummaryQueryDto) {
    return this.analytics.summary(q.days);
  }
}
