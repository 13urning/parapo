import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { JwtPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';

class PushKeysDto {
  @IsString()
  @MaxLength(256)
  p256dh!: string;

  @IsString()
  @MaxLength(256)
  auth!: string;
}

export class SubscribeDto {
  @IsUrl({ protocols: ['https'], require_protocol: true, require_tld: false })
  @MaxLength(2048)
  endpoint!: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys!: PushKeysDto;
}

export class UnsubscribeDto {
  @IsString()
  @MaxLength(2048)
  endpoint!: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly push: PushService,
  ) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.notifications.list(user.sub);
  }

  @Post('read-all')
  @HttpCode(204)
  async readAll(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.notifications.markAllRead(user.sub);
  }

  @Get('push/public-key')
  async publicKey() {
    return { publicKey: await this.push.getPublicKey() };
  }

  @Post('push/subscribe')
  @HttpCode(201)
  async subscribe(@CurrentUser() user: JwtPayload, @Body() dto: SubscribeDto): Promise<void> {
    await this.notifications.subscribe(user.sub, dto.endpoint, dto.keys.p256dh, dto.keys.auth);
  }

  @Post('push/unsubscribe')
  @HttpCode(204)
  async unsubscribe(@CurrentUser() user: JwtPayload, @Body() dto: UnsubscribeDto): Promise<void> {
    await this.notifications.unsubscribe(user.sub, dto.endpoint);
  }

  @Post(':id/read')
  @HttpCode(204)
  async read(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    await this.notifications.markRead(user.sub, id);
  }
}
