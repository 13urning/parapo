import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Route-level guard for login/register: tracks by the lower-cased email in the body so a single
 * account is capped regardless of source IP (X-Forwarded-For can be spoofed). Falls back to the IP
 * when the body has no usable email. It runs in addition to the global IP-based limit.
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
}
