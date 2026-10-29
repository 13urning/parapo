import { dayKey, formatDayHeading, formatKmShort } from './format';

describe('format helpers', () => {
  it('formats short kilometres with one decimal', () => {
    expect(formatKmShort(6.84)).toBe('6.8 km');
  });

  it('groups by local calendar day', () => {
    expect(dayKey('2026-10-01T08:00:00')).toBe('2026-10-01');
    expect(dayKey('2026-10-01T23:59:00')).toBe('2026-10-01');
  });

  it('labels today and yesterday, and dates older days', () => {
    const now = new Date(2026, 9, 29, 12, 0, 0);
    expect(formatDayHeading(new Date(2026, 9, 29, 7, 0, 0).toISOString(), now)).toBe('Today');
    expect(formatDayHeading(new Date(2026, 9, 28, 22, 0, 0).toISOString(), now)).toBe('Yesterday');
    expect(formatDayHeading(new Date(2026, 9, 12, 9, 0, 0).toISOString(), now)).toMatch(/Oct/);
  });
});
