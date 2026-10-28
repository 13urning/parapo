import {
  ExecutionContext,
  ForbiddenException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { AppConfig } from '../config/app-config';
import { RequestGuard } from './request-guard';

const guard = new RequestGuard({ webOrigin: 'http://localhost:3000' } as AppConfig);
const ctx = (method: string, headers: Record<string, string> = {}) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ method, headers }) }),
  }) as unknown as ExecutionContext;

describe('RequestGuard', () => {
  it('ignores GET', () => {
    expect(guard.canActivate(ctx('GET', { origin: 'http://evil.test' }))).toBe(true);
  });

  it('rejects a foreign Origin on writes with 403', () => {
    expect(() => guard.canActivate(ctx('POST', { origin: 'http://evil.test' }))).toThrow(
      ForbiddenException,
    );
  });

  it('allows missing Origin and the configured Origin', () => {
    expect(guard.canActivate(ctx('DELETE'))).toBe(true);
    expect(guard.canActivate(ctx('POST', { origin: 'http://localhost:3000' }))).toBe(true);
  });

  it('rejects non-JSON bodies with 415', () => {
    expect(() =>
      guard.canActivate(ctx('POST', { 'content-length': '5', 'content-type': 'text/plain' })),
    ).toThrow(UnsupportedMediaTypeException);
    expect(() =>
      guard.canActivate(
        ctx('PATCH', {
          'content-length': '5',
          'content-type': 'application/x-www-form-urlencoded',
        }),
      ),
    ).toThrow(UnsupportedMediaTypeException);
  });

  it('accepts JSON (with charset) and bodiless POSTs', () => {
    expect(
      guard.canActivate(
        ctx('POST', { 'content-length': '5', 'content-type': 'application/json; charset=utf-8' }),
      ),
    ).toBe(true);
    expect(guard.canActivate(ctx('POST', { 'content-length': '0' }))).toBe(true);
    expect(guard.canActivate(ctx('POST'))).toBe(true);
  });
});
