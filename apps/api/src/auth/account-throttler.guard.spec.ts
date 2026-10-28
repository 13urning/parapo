import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccountThrottlerGuard } from './account-throttler.guard';

describe('AccountThrottlerGuard tracker', () => {
  let guard: AccountThrottlerGuard;
  const tracker = (req: Record<string, unknown>) =>
    (guard as unknown as { getTracker(r: unknown): Promise<string> }).getTracker(req);

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }])],
      providers: [AccountThrottlerGuard],
    }).compile();
    guard = mod.get(AccountThrottlerGuard);
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
