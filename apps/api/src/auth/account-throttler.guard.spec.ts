import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerException, ThrottlerModule } from '@nestjs/throttler';
import {
  AccountThrottlerGuard,
  ACCOUNT_LIMIT,
  AUTH_GLOBAL_LIMIT,
  AuthGlobalThrottlerGuard,
} from './account-throttler.guard';

class FakeController {}
function login() {}
function register() {}

const ctx = (handler: () => void, req: Record<string, unknown>): ExecutionContext =>
  ({
    getClass: () => FakeController,
    getHandler: () => handler,
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({ header: jest.fn(), setHeader: jest.fn() }),
    }),
  }) as unknown as ExecutionContext;

async function build() {
  const mod = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }])],
    providers: [AccountThrottlerGuard, AuthGlobalThrottlerGuard],
  }).compile();
  await mod.init();
  return {
    account: mod.get(AccountThrottlerGuard),
    global: mod.get(AuthGlobalThrottlerGuard),
  };
}

const req = (email: unknown, ip = '172.18.0.5') => ({ ip, body: { email }, headers: {} });

describe('AccountThrottlerGuard tracker', () => {
  let guard: AccountThrottlerGuard;
  const tracker = (r: Record<string, unknown>) =>
    (guard as unknown as { getTracker(r: unknown): Promise<string> }).getTracker(r);

  beforeAll(async () => {
    guard = (await build()).account;
  });

  it('keys on the lower-cased, trimmed email regardless of IP', async () => {
    const a = await tracker({ ip: '1.1.1.1', body: { email: ' Juan@Parapo.Local ' } });
    const b = await tracker({ ip: '9.9.9.9', body: { email: 'juan@parapo.local' } });
    expect(a).toBe('email:juan@parapo.local');
    expect(b).toBe(a);
  });

  it('keys different accounts separately', async () => {
    const a = await tracker({ ip: '1.1.1.1', body: { email: 'a@x.test' } });
    const b = await tracker({ ip: '1.1.1.1', body: { email: 'b@x.test' } });
    expect(a).not.toBe(b);
  });

  it('falls back to the IP when the body has no usable email', async () => {
    expect(await tracker({ ip: '1.1.1.1', body: {} })).toBe('ip:1.1.1.1');
    expect(await tracker({ ip: '1.1.1.1' })).toBe('ip:1.1.1.1');
    expect(await tracker({ ip: '1.1.1.1', body: { email: 42 } })).toBe('ip:1.1.1.1');
    expect(await tracker({ ip: '1.1.1.1', body: { email: '   ' } })).toBe('ip:1.1.1.1');
  });
});

describe('auth throttling limits', () => {
  it('caps one account at 5 attempts/min across login+register, whatever the IP or email case', async () => {
    const { account } = await build();
    expect(ACCOUNT_LIMIT).toBe(5);
    for (let i = 0; i < 5; i++) {
      const handler = i % 2 ? register : login;
      await expect(
        account.canActivate(ctx(handler, req('Victim@X.test', `10.0.0.${i}`))),
      ).resolves.toBe(true);
    }
    await expect(
      account.canActivate(ctx(login, req('victim@x.test', '10.9.9.9'))),
    ).rejects.toBeInstanceOf(ThrottlerException);
    // Another account is unaffected.
    await expect(account.canActivate(ctx(login, req('other@x.test')))).resolves.toBe(true);
  });

  it('caps all clients together at 30/min across login+register (password spraying)', async () => {
    const { global } = await build();
    expect(AUTH_GLOBAL_LIMIT).toBe(30);
    for (let i = 0; i < 30; i++) {
      const handler = i % 2 ? register : login;
      await expect(global.canActivate(ctx(handler, req(`user${i}@x.test`)))).resolves.toBe(true);
    }
    await expect(global.canActivate(ctx(login, req('user31@x.test')))).rejects.toBeInstanceOf(
      ThrottlerException,
    );
    await expect(global.canActivate(ctx(register, req('new@x.test')))).rejects.toBeInstanceOf(
      ThrottlerException,
    );
  });
});
