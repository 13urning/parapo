import { decodeJwtPayload, isExpired } from './jwt';

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
