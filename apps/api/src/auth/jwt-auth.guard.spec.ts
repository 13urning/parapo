import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SecretsService } from '../config/secrets.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenService } from './token.service';

/** In-memory users table that implements just the token-version methods. */
function setup() {
  const db = new Map<string, number>([['u1', 0]]);
  const users = {
    getTokenVersion: jest.fn((id: string) => Promise.resolve(db.get(id) ?? null)),
    revokeSessions: jest.fn((id: string, ver: number) => {
      if (db.get(id) === ver) db.set(id, ver + 1);
      return Promise.resolve();
    }),
  };
  const secrets = { getJwtSecret: jest.fn().mockResolvedValue('s3cret') };
  const tokens = new TokenService(new JwtService(), secrets as unknown as SecretsService);
  const guard = new JwtAuthGuard(tokens, users as unknown as UsersService);
  const auth = new AuthService(users as unknown as UsersService, tokens);
  const ctx = (token?: string) => {
    const req: Record<string, unknown> = { cookies: token ? { parapo_session: token } : {} };
    return {
      req,
      ctx: { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext,
    };
  };
  return { db, users, tokens, guard, auth, ctx };
}

describe('JwtAuthGuard + logout revocation', () => {
  it('accepts a token whose ver matches and attaches the user', async () => {
    const { tokens, guard, ctx } = setup();
    const token = await tokens.sign({ sub: 'u1', role: 'COMMUTER', name: 'J', ver: 0 });
    const { req, ctx: c } = ctx(token);
    await expect(guard.canActivate(c)).resolves.toBe(true);
    expect(req.user).toEqual(expect.objectContaining({ sub: 'u1', ver: 0 }));
  });

  it('rejects missing, invalid, unknown-user and stale-version tokens with 401', async () => {
    const { tokens, guard, ctx } = setup();
    await expect(guard.canActivate(ctx().ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(guard.canActivate(ctx('junk').ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    const ghost = await tokens.sign({ sub: 'ghost', role: 'ADMIN', name: 'G', ver: 0 });
    await expect(guard.canActivate(ctx(ghost).ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    const stale = await tokens.sign({ sub: 'u1', role: 'COMMUTER', name: 'J', ver: 5 });
    await expect(guard.canActivate(ctx(stale).ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logout bumps tokenVersion so the old (still unexpired) token is rejected', async () => {
    const { db, tokens, guard, auth, ctx } = setup();
    const token = await tokens.sign({ sub: 'u1', role: 'COMMUTER', name: 'J', ver: 0 });
    await expect(guard.canActivate(ctx(token).ctx)).resolves.toBe(true);

    await auth.logout(token);

    expect(db.get('u1')).toBe(1);
    await expect(guard.canActivate(ctx(token).ctx)).rejects.toBeInstanceOf(UnauthorizedException);

    // A token issued after logout (new login) carries the new version and works.
    const fresh = await tokens.sign({ sub: 'u1', role: 'COMMUTER', name: 'J', ver: 1 });
    await expect(guard.canActivate(ctx(fresh).ctx)).resolves.toBe(true);
  });

  it('replaying logout with an already-revoked token does not bump the version again', async () => {
    const { db, tokens, auth } = setup();
    const token = await tokens.sign({ sub: 'u1', role: 'COMMUTER', name: 'J', ver: 0 });
    await auth.logout(token);
    await auth.logout(token);
    expect(db.get('u1')).toBe(1);
  });

  it('logout with no or an invalid cookie is a harmless no-op', async () => {
    const { db, users, auth } = setup();
    await auth.logout(undefined);
    await auth.logout('garbage');
    expect(users.revokeSessions).not.toHaveBeenCalled();
    expect(db.get('u1')).toBe(0);
  });
});
