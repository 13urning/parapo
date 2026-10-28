import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { AppConfig } from '../config/app-config';
import { AccountThrottlerGuard, AuthGlobalThrottlerGuard } from './account-throttler.guard';
import { AuthService } from './auth.service';
import { JwtPayload, SESSION_COOKIE, SESSION_TTL_SECONDS } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: AppConfig,
  ) {}

  private cookieOptions(): CookieOptions {
    return { httpOnly: true, sameSite: 'lax', path: '/', secure: this.config.cookieSecure };
  }

  // Throttling: see account-throttler.guard.ts (per-account 5/min + all-clients 30/min).
  @Post('register')
  @UseGuards(AuthGlobalThrottlerGuard, AccountThrottlerGuard)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.register(dto);
    res.cookie(SESSION_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: SESSION_TTL_SECONDS * 1000,
    });
    return user;
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthGlobalThrottlerGuard, AccountThrottlerGuard)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.login(dto);
    res.cookie(SESSION_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: SESSION_TTL_SECONDS * 1000,
    });
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const cookies = req.cookies as Record<string, string | undefined> | undefined;
    // Revokes every token issued so far for this user (server-side), then clears the cookie.
    await this.auth.logout(cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE, this.cookieOptions());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user.sub);
  }
}
