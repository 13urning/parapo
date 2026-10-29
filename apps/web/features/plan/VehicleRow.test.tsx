import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FareQuote } from '@/lib/api/types';
import type { VehicleQuote } from '@/lib/quotes';
import { RideList } from './RideList';
import { VehicleRow } from './VehicleRow';

const quote = (over: Partial<FareQuote> = {}): FareQuote => ({
  vehicleType: 'TRADITIONAL_JEEPNEY',
  distanceKm: 10.2,
  fareCategory: 'STUDENT',
  regularFare: 23.75,
  discountApplied: true,
  fare: 19,
  matrixId: 'm1',
  matrixEffectiveDate: '2026-01-01',
  ...over,
});
const ready = (over: Partial<FareQuote> = {}): VehicleQuote => ({
  vehicleType: over.vehicleType ?? 'TRADITIONAL_JEEPNEY',
  status: 'ready',
  quote: quote(over),
});

const props = { index: 0, groupName: 'g', selected: false, cheapest: false, onSelect: vi.fn(), onRetry: vi.fn() };

describe('VehicleRow', () => {
  it('shows the discounted fare large with the regular fare struck under it', () => {
    render(<VehicleRow {...props} item={ready()} />);
    expect(screen.getByTestId('fare')).toHaveTextContent('₱19.00');
    expect(screen.getByTestId('regular-fare')).toHaveTextContent('₱23.75');
    expect(screen.getByTestId('regular-fare').tagName).toBe('S');
    expect(screen.getByRole('radio', { name: /regular fare ₱23\.75/ })).toBeInTheDocument();
  });

  it('hides the struck fare when no discount applies', () => {
    render(
      <VehicleRow {...props} item={ready({ fareCategory: 'REGULAR', fare: 23.75, regularFare: 23.75, discountApplied: false })} />,
    );
    expect(screen.queryByTestId('regular-fare')).not.toBeInTheDocument();
  });

  it('describes the vehicle truthfully, with no invented travel time', () => {
    render(<VehicleRow {...props} item={ready({ vehicleType: 'MODERN_JEEPNEY' })} />);
    expect(screen.getByText('Modern jeepney')).toBeInTheDocument();
    expect(screen.getByText('Aircon')).toBeInTheDocument();
    expect(screen.queryByText(/min/)).not.toBeInTheDocument();
  });

  it('tags the cheapest ride', () => {
    const { rerender } = render(<VehicleRow {...props} item={ready()} />);
    expect(screen.queryByText('Cheapest')).not.toBeInTheDocument();
    rerender(<VehicleRow {...props} item={ready()} cheapest />);
    expect(screen.getByText('Cheapest')).toBeInTheDocument();
  });

  it('calls onSelect when the row is chosen', async () => {
    const onSelect = vi.fn();
    render(<VehicleRow {...props} item={ready()} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('radio'));
    expect(onSelect).toHaveBeenCalledWith('TRADITIONAL_JEEPNEY');
  });

  it('shows a quiet "No published fare" and cannot be selected', async () => {
    const onSelect = vi.fn();
    render(<VehicleRow {...props} item={{ vehicleType: 'UV_EXPRESS', status: 'unavailable' }} onSelect={onSelect} />);
    expect(screen.getByText('No published fare')).toBeInTheDocument();
    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
    await userEvent.click(radio);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('offers a retry when the quote failed', async () => {
    const onRetry = vi.fn();
    render(<VehicleRow {...props} item={{ vehicleType: 'UV_EXPRESS', status: 'error' }} onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledWith('UV_EXPRESS');
  });
});

describe('RideList', () => {
  it('is one radio group with the selected ride checked', () => {
    const items: VehicleQuote[] = [
      ready({ vehicleType: 'TRADITIONAL_JEEPNEY', fare: 15 }),
      ready({ vehicleType: 'MODERN_JEEPNEY', fare: 18 }),
      { vehicleType: 'UV_EXPRESS', status: 'unavailable' },
    ];
    render(<RideList items={items} selected="MODERN_JEEPNEY" cheapest="TRADITIONAL_JEEPNEY" onSelect={vi.fn()} onRetry={vi.fn()} />);
    const group = screen.getByRole('radiogroup', { name: 'Choose a ride' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /Modern jeepney, Aircon/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Jeepney, Traditional/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /UV Express/ })).toBeDisabled();
  });
});
