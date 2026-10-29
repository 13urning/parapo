import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FareMatrix } from '@/lib/api/types';
import { computeFare } from '@/lib/fare';
import { FareCalculator, parseKm } from './FareCalculator';

const matrix: FareMatrix = {
  id: 'm1',
  vehicleType: 'TRADITIONAL_JEEPNEY',
  baseFare: 13,
  baseKm: 4,
  perKmRate: 1.8,
  discountPercent: 20,
  effectiveDate: '2026-01-01',
  status: 'PUBLISHED',
  notes: null,
  publishedAt: '2026-01-01T00:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('parseKm', () => {
  it('accepts positive numbers, including a decimal comma', () => {
    expect(parseKm('6.8')).toBe(6.8);
    expect(parseKm(' 6,8 ')).toBe(6.8);
  });

  it('rejects empty, zero, negative and absurd values', () => {
    expect(parseKm('')).toBeNull();
    expect(parseKm('0')).toBeNull();
    expect(parseKm('-3')).toBeNull();
    expect(parseKm('abc')).toBeNull();
    expect(parseKm('100000')).toBeNull();
  });
});

describe('FareCalculator', () => {
  it('computes the discounted fare live from the matrix and strikes the regular fare', async () => {
    const user = userEvent.setup();
    render(<FareCalculator matrix={matrix} category="STUDENT" />);

    const input = screen.getByLabelText('Distance');
    await user.clear(input);
    await user.type(input, '10');

    const expected = computeFare(matrix, 10, 'STUDENT');
    expect(screen.getByTestId('calc-fare')).toHaveTextContent(`₱${expected.fare.toFixed(2)}`);
    expect(screen.getByTestId('calc-regular')).toHaveTextContent(`₱${expected.regularFare.toFixed(2)}`);
    expect(screen.getByText('−20%')).toBeInTheDocument();
  });

  it('shows only the regular fare for a regular rider', () => {
    render(<FareCalculator matrix={matrix} category="REGULAR" />);
    // 5 km: base 13 + ceil(5 - 4) * 1.80 = 14.80, rounded to the nearest 0.25.
    expect(screen.getByTestId('calc-fare')).toHaveTextContent('₱14.75');
    expect(screen.queryByTestId('calc-regular')).not.toBeInTheDocument();
  });

  it('follows the slider', () => {
    render(<FareCalculator matrix={matrix} category="REGULAR" />);
    fireEvent.change(screen.getByRole('slider', { name: 'Distance in kilometres' }), { target: { value: '12' } });
    expect(screen.getByLabelText('Distance')).toHaveValue('12');
    expect(screen.getByTestId('calc-fare')).toHaveTextContent(`₱${computeFare(matrix, 12).fare.toFixed(2)}`);
  });

  it('asks for a valid distance instead of showing a fare', async () => {
    const user = userEvent.setup();
    render(<FareCalculator matrix={matrix} category="REGULAR" />);
    await user.clear(screen.getByLabelText('Distance'));
    expect(screen.queryByTestId('calc-fare')).not.toBeInTheDocument();
    expect(screen.getByText('Enter a distance above 0 km.')).toBeInTheDocument();
    expect(screen.getByLabelText('Distance')).toBeInvalid();
  });

  it('summarises the matrix terms', () => {
    render(<FareCalculator matrix={matrix} category="REGULAR" />);
    expect(screen.getByText('₱13.00 for the first 4 km')).toBeInTheDocument();
    expect(screen.getByText('₱1.80, rounded up')).toBeInTheDocument();
    expect(screen.getByText(/20% off for student/)).toBeInTheDocument();
  });
});
