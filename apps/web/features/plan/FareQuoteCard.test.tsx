import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FareQuote } from '@/lib/api/types';
import { FareQuoteCard } from './FareQuoteCard';

const base: FareQuote = {
  vehicleType: 'TRADITIONAL_JEEPNEY',
  distanceKm: 10.2,
  fareCategory: 'STUDENT',
  regularFare: 23.75,
  discountApplied: true,
  fare: 19,
  matrixId: 'm1',
  matrixEffectiveDate: '2026-01-01',
};

describe('FareQuoteCard', () => {
  it('shows the discounted fare, the struck-through regular fare and the saving', () => {
    render(<FareQuoteCard quote={base} estimated={false} onSave={vi.fn()} />);
    expect(screen.getByTestId('fare')).toHaveTextContent('₱19.00');
    expect(screen.getByTestId('regular-fare')).toHaveTextContent('₱23.75');
    expect(screen.getByText(/you save ₱4\.75/i)).toBeInTheDocument();
    expect(screen.getByText('Discounted fare')).toBeInTheDocument();
    expect(screen.getByText(/student/i)).toBeInTheDocument();
  });

  it('hides discount details for regular fares', () => {
    render(
      <FareQuoteCard quote={{ ...base, fareCategory: 'REGULAR', fare: 23.75, discountApplied: false }} estimated={false} onSave={vi.fn()} />,
    );
    expect(screen.queryByTestId('regular-fare')).not.toBeInTheDocument();
    expect(screen.queryByText(/you save/i)).not.toBeInTheDocument();
  });

  it('shows the estimated distance badge only when estimated', () => {
    const { rerender } = render(<FareQuoteCard quote={base} estimated={false} onSave={vi.fn()} />);
    expect(screen.queryByText('Estimated distance')).not.toBeInTheDocument();
    rerender(<FareQuoteCard quote={base} estimated onSave={vi.fn()} />);
    expect(screen.getByText('Estimated distance')).toBeInTheDocument();
  });

  it('calls onSave and reflects the saved state', async () => {
    const onSave = vi.fn();
    const { rerender } = render(<FareQuoteCard quote={base} estimated={false} onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save trip' }));
    expect(onSave).toHaveBeenCalledOnce();
    rerender(<FareQuoteCard quote={base} estimated={false} onSave={onSave} saved />);
    expect(screen.getByRole('button', { name: 'Trip saved' })).toBeDisabled();
  });
});
