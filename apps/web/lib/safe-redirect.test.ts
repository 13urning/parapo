import { safeNext } from './safe-redirect';

describe('safeNext', () => {
  it.each([
    '/%09/evil.example',
    '/\tevil.example',
    '/\nevil.example',
    '//evil.example',
    '/\\evil.example',
    '/%5Cevil.example',
    '\\\\evil.example',
    'https://evil.example',
    'javascript:alert(1)',
    'evil.example',
    '/%',
    '',
    '/login',
  ])('rejects %j', (input) => {
    expect(safeNext(input)).toBe('/plan');
  });

  it('rejects null and undefined', () => {
    expect(safeNext(null)).toBe('/plan');
    expect(safeNext(undefined, '/x')).toBe('/x');
  });

  it.each(['/trips', '/trips?page=2', '/admin/fare-matrices/new', '/fares#top', '/trips?page=2#x'])(
    'accepts %s',
    (input) => {
      expect(safeNext(input)).toBe(input);
    },
  );
});
