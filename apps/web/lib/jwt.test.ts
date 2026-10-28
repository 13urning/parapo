import { decodeJwtPayload, isExpired } from './jwt';
import { safeNext } from './safe-redirect';

const enc = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

describe('decodeJwtPayload', () => {
  it('decodes the payload without verifying', () => {
    const t = `${enc({ alg: 'HS256' })}.${enc({ sub: '1', role: 'ADMIN', name: 'Ada' })}.whatever`;
    expect(decodeJwtPayload(t)).toEqual({ sub: '1', role: 'ADMIN', name: 'Ada' });
  });

  it('returns null for missing or malformed tokens', () => {
    expect(decodeJwtPayload(undefined)).toBeNull();
    expect(decodeJwtPayload('abc')).toBeNull();
    expect(decodeJwtPayload('a.@@@.c')).toBeNull();
  });

  it('detects expiry', () => {
    expect(isExpired({ exp: 1 })).toBe(true);
    expect(isExpired({ exp: Math.floor(Date.now() / 1000) + 60 })).toBe(false);
    expect(isExpired({})).toBe(false);
  });
});

describe('safeNext', () => {
  it('allows relative paths only', () => {
    expect(safeNext('/trips?page=2')).toBe('/trips?page=2');
    expect(safeNext('//evil.example')).toBe('/plan');
    expect(safeNext('https://evil.example')).toBe('/plan');
    expect(safeNext(null)).toBe('/plan');
    expect(safeNext('/login')).toBe('/plan');
  });
});
