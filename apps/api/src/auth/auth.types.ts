import { Role } from '@prisma/client';
import type { Request } from 'express';

export const SESSION_COOKIE = 'parapo_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface JwtPayload {
  sub: string;
  role: Role;
  name: string;
}

export type AuthedRequest = Request & { user: JwtPayload };
