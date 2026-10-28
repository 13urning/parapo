import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { placesApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { renderWithProviders } from '@/tests/test-utils';
import { PlaceCombobox } from './PlaceCombobox';

vi.mock('@/lib/api/endpoints', () => ({ placesApi: { search: vi.fn(), route: vi.fn() } }));
const search = vi.mocked(placesApi.search);

const lawton = { label: 'Lawton, Manila', lat: 14.59, lng: 120.98 };

describe('PlaceCombobox', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not search until 3 characters are typed, then selects a result', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    search.mockResolvedValue([lawton]);
    renderWithProviders(<PlaceCombobox label="From" value={null} onChange={onChange} debounceMs={10} />);

    const input = screen.getByRole('combobox', { name: 'From' });
    await user.type(input, 'La');
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();

    await user.type(input, 'w');
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1));
    expect(search.mock.calls[0][0]).toBe('Law');

    await user.click(await screen.findByRole('option', { name: 'Lawton, Manila' }));
    expect(onChange).toHaveBeenCalledWith(lawton);
    expect(input).toHaveValue('Lawton, Manila');
  });

  it('shows a friendly message when search is unavailable (503)', async () => {
    const user = userEvent.setup();
    search.mockRejectedValue(new ApiError(503, 'Place search is temporarily unavailable'));
    renderWithProviders(<PlaceCombobox label="To" value={null} onChange={vi.fn()} debounceMs={10} />);

    await user.type(screen.getByRole('combobox', { name: 'To' }), 'Cubao');
    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
  });

  it('supports keyboard selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    search.mockResolvedValue([lawton]);
    renderWithProviders(<PlaceCombobox label="From" value={null} onChange={onChange} debounceMs={10} />);

    await user.type(screen.getByRole('combobox'), 'Lawton');
    await screen.findByRole('option');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith(lawton);
  });
});
