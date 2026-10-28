import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SecretsService } from '../config/secrets.service';
import { JwtPayload, SESSION_TTL_SECONDS } from './auth.types';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly secrets: SecretsService,
  ) {}

  async sign(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(
      { sub: payload.sub, role: payload.role, name: payload.name },
      {
        secret: await this.secrets.getJwtSecret(),
        algorithm: 'HS256',
        expiresIn: SESSION_TTL_SECONDS,
      },
    );
  }

  /** Returns the payload, or null for any invalid/expired/malformed token. Never throws. */
  async verify(token: string | undefined): Promise<JwtPayload | null> {
    if (!token) return null;
    try {
      const p = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: await this.secrets.getJwtSecret(),
        algorithms: ['HS256'],
      });
      return typeof p.sub === 'string' ? p : null;
    } catch {
      return null;
    }
  }
}
