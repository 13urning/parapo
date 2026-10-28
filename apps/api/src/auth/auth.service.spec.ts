import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService, BCRYPT_COST, INVALID_CREDENTIALS } from './auth.service';
import { TokenService } from './token.service';
import { UsersService } from '../users/users.service';

jest.mock('bcryptjs', () => {
  const actual = jest.requireActual<typeof import('bcryptjs')>('bcryptjs');
  return { ...actual, compare: jest.fn(actual.compare) };
});

jest.setTimeout(30000);

describe('AuthService', () => {
  let hash: string;
  const base = {
    id: 'u1',
    name: 'Juan',
    email: 'juan@parapo.local',
    role: 'COMMUTER',
    fareCategory: 'STUDENT',
    createdAt: new Date(),
  };

  beforeAll(async () => {
    hash = await bcrypt.hash('Commuter#2026', BCRYPT_COST);
  });

  function setup(found: object | null) {
    const users = {
      findByEmail: jest.fn().mockResolvedValue(found),
      findById: jest.fn(),
      create: jest.fn().mockImplementation((d) => Promise.resolve({ ...base, ...d })),
    };
    const tokens = { sign: jest.fn().mockResolvedValue('jwt-token') };
    const service = new AuthService(
      users as unknown as UsersService,
      tokens as unknown as TokenService,
    );
    return { users, tokens, service };
  }

  it('uses bcrypt cost 12', () => {
    expect(BCRYPT_COST).toBe(12);
    expect(hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$')).toBe(true);
  });

  describe('register', () => {
    it('rejects a duplicate email with 409', async () => {
      const { service, users } = setup({ ...base, passwordHash: hash });
      await expect(
        service.register({
          name: 'X',
          email: 'JUAN@parapo.local',
          password: 'password1',
          fareCategory: 'REGULAR',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(users.findByEmail).toHaveBeenCalledWith('juan@parapo.local');
      expect(users.create).not.toHaveBeenCalled();
    });

    it('creates a COMMUTER with a hashed password and never returns the hash', async () => {
      const { service, users } = setup(null);
      const res = await service.register({
        name: 'New',
        email: 'new@parapo.local',
        password: 'password1',
        fareCategory: 'PWD',
      });
      const data = users.create.mock.calls[0][0];
      expect(data.role).toBe('COMMUTER');
      expect(data.passwordHash).not.toBe('password1');
      expect(await bcrypt.compare('password1', data.passwordHash)).toBe(true);
      expect(res.token).toBe('jwt-token');
      expect(res.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('succeeds with valid credentials', async () => {
      const { service, tokens } = setup({ ...base, passwordHash: hash });
      const res = await service.login({ email: 'juan@parapo.local', password: 'Commuter#2026' });
      expect(res.user.email).toBe('juan@parapo.local');
      expect(res.user).not.toHaveProperty('passwordHash');
      expect(tokens.sign).toHaveBeenCalledWith({ sub: 'u1', role: 'COMMUTER', name: 'Juan' });
    });

    it('gives the same 401 message for wrong password and unknown email (no enumeration)', async () => {
      const wrong = setup({ ...base, passwordHash: hash });
      const unknown = setup(null);
      const e1 = await wrong.service
        .login({ email: 'juan@parapo.local', password: 'nope-nope' })
        .catch((e: unknown) => e);
      const e2 = await unknown.service
        .login({ email: 'ghost@parapo.local', password: 'nope-nope' })
        .catch((e: unknown) => e);
      expect(e1).toBeInstanceOf(UnauthorizedException);
      expect(e2).toBeInstanceOf(UnauthorizedException);
      expect((e1 as UnauthorizedException).message).toBe(INVALID_CREDENTIALS);
      expect((e2 as UnauthorizedException).getResponse()).toEqual(
        (e1 as UnauthorizedException).getResponse(),
      );
    });

    it('still performs a bcrypt compare for unknown emails (dummy hash)', async () => {
      const spy = bcrypt.compare as unknown as jest.Mock;
      spy.mockClear();
      const { service } = setup(null);
      await service
        .login({ email: 'ghost@parapo.local', password: 'whatever1' })
        .catch(() => undefined);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
