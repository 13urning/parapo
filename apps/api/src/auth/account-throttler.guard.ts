import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

export const ACCOUNT_LIMIT = 5; // per account per minute (login + register combined)
export const AUTH_GLOBAL_LIMIT = 30; // all clients together per minute (login + register combined)
export const AUTH_WINDOW_MS = 60_000;

/**
 * Brute-force protection for login/register, in three layers:
 *  1. AccountThrottlerGuard: 5/min per lower-cased email (falls back to IP), shared by both routes.
 *     Caps guessing against one account regardless of source IP.
 *  2. AuthGlobalThrottlerGuard: 30/min across ALL clients (fixed key), shared by both routes.
 *     The web proxy no longer forwards client X-Forwarded-For, so every request arrives from the
 *     proxy IP; a per-IP limit would be meaningless, and per-account limits alone do not bound
 *     password spraying across many accounts. This bounds total login+register attempts.
 *  3. The global per-IP default (300/min) in AppModule for everything else.
 * Limits are set here (not via @Throttle) so the global per-IP guard keeps its generic default.
 */
@Injectable()
export class AccountThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    const body = req.body as { email?: unknown } | undefined;
    const email = body?.email;
    if (typeof email === 'string' && email.trim().length > 0) {
      return Promise.resolve(`email:${email.trim().toLowerCase().slice(0, 254)}`);
    }
    return Promise.resolve(`ip:${String(req.ip ?? 'unknown')}`);
  }

  protected override generateKey(_context: ExecutionContext, suffix: string): string {
    return `auth-account:${suffix}`;
  }

  protected override handleRequest(props: ThrottlerRequest): Promise<boolean> {
    return super.handleRequest({ ...props, limit: ACCOUNT_LIMIT, ttl: AUTH_WINDOW_MS });
  }
}

@Injectable()
export class AuthGlobalThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(): Promise<string> {
    return Promise.resolve('auth-global');
  }

  protected override generateKey(): string {
    return 'auth-global';
  }

  protected override handleRequest(props: ThrottlerRequest): Promise<boolean> {
    return super.handleRequest({ ...props, limit: AUTH_GLOBAL_LIMIT, ttl: AUTH_WINDOW_MS });
  }
}
