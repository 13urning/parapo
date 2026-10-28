import { Role } from '@prisma/client';
import type { Request } from 'express';

export const SESSION_COOKIE = 'parapo_session';
export const SESSION_TTL_SECONDS = 24 * 60 * 60;

export interface JwtPayload {
  sub: string;
  role: Role;
  name: string;
  /** User.tokenVersion at issue time; a mismatch means the session was revoked. */
  ver: number;
}

export type AuthedRequest = Request & { user: JwtPayload };
