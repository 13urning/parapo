import type { Request, Response } from 'express';
import { AppConfig } from '../config/app-config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

function setup(cookieSecure: boolean) {
  const auth = {
    register: jest.fn().mockResolvedValue({ user: { id: 'u1' }, token: 'tok' }),
    logout: jest.fn().mockResolvedValue(undefined),
    login: jest.fn().mockResolvedValue({ user: { id: 'u1' }, token: 'tok' }),
  };
  const controller = new AuthController(
    auth as unknown as AuthService,
    { cookieSecure } as AppConfig,
  );
  const res = { cookie: jest.fn(), clearCookie: jest.fn() };
  return { controller, auth, res: res as unknown as Response, mocks: res };
}

describe('AuthController session cookie', () => {
  it.each([true, false])(
    'login sets an httpOnly, SameSite=Lax cookie (secure=%p)',
    async (secure) => {
      const { controller, res, mocks } = setup(secure);
      await controller.login({ email: 'a@b.test', password: 'x' }, res);
      const [name, value, opts] = mocks.cookie.mock.calls[0];
      expect(name).toBe('parapo_session');
      expect(value).toBe('tok');
      expect(opts).toEqual(
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure,
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );
    },
  );

  it('register sets the same cookie flags', async () => {
    const { controller, res, mocks } = setup(true);
    await controller.register(
      { name: 'N', email: 'a@b.test', password: 'password1', fareCategory: 'REGULAR' },
      res,
    );
    expect(mocks.cookie.mock.calls[0][2]).toEqual(
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', secure: true }),
    );
  });

  it('logout revokes the session server-side and clears the cookie with matching attributes', async () => {
    const { controller, auth, res, mocks } = setup(true);
    const req = { cookies: { parapo_session: 'the-token' } } as unknown as Request;
    await controller.logout(req, res);
    expect(auth.logout).toHaveBeenCalledWith('the-token');
    expect(mocks.clearCookie).toHaveBeenCalledWith(
      'parapo_session',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/', secure: true }),
    );
  });
});
