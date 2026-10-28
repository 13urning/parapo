import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

class Handlers {
  @Roles('ADMIN')
  adminOnly() {}

  open() {}
}

const ctx = (handler: () => void, user?: { role: string }) =>
  ({
    getHandler: () => handler,
    getClass: () => Handlers,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());
  const h = new Handlers();

  it('rejects a COMMUTER on an @Roles("ADMIN") route with 403', () => {
    expect(() => guard.canActivate(ctx(h.adminOnly, { role: 'COMMUTER' }))).toThrow(
      ForbiddenException,
    );
  });

  it('allows an ADMIN', () => {
    expect(guard.canActivate(ctx(h.adminOnly, { role: 'ADMIN' }))).toBe(true);
  });

  it('rejects when no user is attached', () => {
    expect(() => guard.canActivate(ctx(h.adminOnly))).toThrow(ForbiddenException);
  });

  it('allows any authenticated role when no roles are required', () => {
    expect(guard.canActivate(ctx(h.open, { role: 'COMMUTER' }))).toBe(true);
  });
});
