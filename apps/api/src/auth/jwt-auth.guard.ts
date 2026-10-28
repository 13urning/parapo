import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthedRequest, SESSION_COOKIE } from './auth.types';
import { UsersService } from '../users/users.service';
import { TokenService } from './token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const cookies = req.cookies as Record<string, string | undefined> | undefined;
    const payload = await this.tokens.verify(cookies?.[SESSION_COOKIE]);
    if (!payload) throw new UnauthorizedException();
    // Revocation check: one primary-key lookup. Unknown user or stale version => 401.
    const current = await this.users.getTokenVersion(payload.sub);
    if (current === null || current !== payload.ver) throw new UnauthorizedException();
    (req as AuthedRequest).user = payload;
    return true;
  }
}
