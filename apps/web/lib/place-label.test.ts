import { shortPlaceLabel } from './place-label';

describe('shortPlaceLabel', () => {
  it('keeps the first two parts of a long geocoder label', () => {
    expect(shortPlaceLabel('Quiapo, Third District, Manila, Metro Manila, Philippines')).toBe('Quiapo, Third District');
  });

  it('honours the parts argument and short labels', () => {
    expect(shortPlaceLabel('Lawton, Manila', 1)).toBe('Lawton');
    expect(shortPlaceLabel('Cubao')).toBe('Cubao');
  });

  it('falls back to the trimmed label when nothing splits out', () => {
    expect(shortPlaceLabel('  ,  ')).toBe(',');
  });
});
