import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tripsApi } from '@/lib/api/endpoints';
import type { Paginated, Trip } from '@/lib/api/types';
import { renderWithProviders } from '@/tests/test-utils';
import { TripHistory } from './TripHistory';

vi.mock('@/lib/api/endpoints', () => ({
  tripsApi: { list: vi.fn(), summary: vi.fn(), create: vi.fn(), remove: vi.fn() },
}));
vi.mock('next/link', () => ({ default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a> }));

const trip = (id: string, dest: string): Trip => ({
  id,
  originLabel: 'Lawton',
  destLabel: dest,
  originLat: 14.59,
  originLng: 120.98,
  destLat: 14.65,
  destLng: 121.05,
  vehicleType: 'MODERN_JEEPNEY',
  distanceKm: 12.4,
  estimated: id === 't2',
  fareCategory: 'STUDENT',
  fare: 25.5,
  createdAt: '2026-10-01T08:00:00Z',
});
const page = (items: Trip[], total = items.length, p = 1): Paginated<Trip> => ({ items, page: p, pageSize: 10, total });

const api = vi.mocked(tripsApi);

describe('TripHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.summary.mockResolvedValue({ monthTotal: 51, monthTrips: 2, allTimeTrips: 7 });
  });

  it('renders month summary and trips', async () => {
    api.list.mockResolvedValue(page([trip('t1', 'UP Diliman'), trip('t2', 'Cubao')]));
    renderWithProviders(<TripHistory />);

    expect(await screen.findByText(/UP Diliman/)).toBeInTheDocument();
    expect(screen.getByText('₱51.00')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Estimated')).toBeInTheDocument();
  });

  it('shows an empty state with a call to action', async () => {
    api.list.mockResolvedValue(page([]));
    renderWithProviders(<TripHistory />);
    expect(await screen.findByText('No trips yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plan a trip' })).toHaveAttribute('href', '/plan');
  });

  it('deletes a trip only after confirming', async () => {
    const user = userEvent.setup();
    api.list.mockResolvedValue(page([trip('t1', 'UP Diliman'), trip('t2', 'Cubao')]));
    api.remove.mockResolvedValue(undefined);
    renderWithProviders(<TripHistory />);

    // Delete is not on the row: open the trip, then choose Delete trip, then confirm.
    await user.click(await screen.findByRole('button', { name: /Trip to UP Diliman/ }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Trip details' })).getByRole('button', { name: 'Delete trip' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete this trip?' });
    expect(api.remove).not.toHaveBeenCalled();

    api.list.mockResolvedValue(page([trip('t2', 'Cubao')]));
    await user.click(within(dialog).getByRole('button', { name: 'Delete trip' }));

    await waitFor(() => expect(api.remove).toHaveBeenCalledWith('t1'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText(/UP Diliman/)).not.toBeInTheDocument());
  });

  it('does not delete when cancelled', async () => {
    const user = userEvent.setup();
    api.list.mockResolvedValue(page([trip('t1', 'UP Diliman')]));
    renderWithProviders(<TripHistory />);

    await user.click(await screen.findByRole('button', { name: /Trip to UP Diliman/ }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Trip details' })).getByRole('button', { name: 'Delete trip' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel' }));

    expect(api.remove).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('requests the next page from the pager', async () => {
    const user = userEvent.setup();
    api.list.mockImplementation(async (p) => page([trip(`t${p}`, `Dest ${p}`)], 25, p));
    renderWithProviders(<TripHistory />);

    await screen.findByText(/Dest 1/);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText(/Dest 2/)).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledWith(2, 10);
  });

  it('shows an error state when loading fails', async () => {
    api.list.mockRejectedValue(new Error('boom'));
    renderWithProviders(<TripHistory />);
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
  });
});

describe('TripHistory rows', () => {
  it('keeps the fare as the row edge: no delete control on the row itself', async () => {
    api.summary.mockResolvedValue({ monthTotal: 51, monthTrips: 2, allTimeTrips: 7 });
    api.list.mockResolvedValue(page([trip('t1', 'UP Diliman')]));
    renderWithProviders(<TripHistory />);
    await screen.findByText(/UP Diliman/);
    expect(screen.queryByRole('button', { name: /^Delete/ })).not.toBeInTheDocument();
  });
});

describe('TripHistory paging and detail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.summary.mockResolvedValue({ monthTotal: 51, monthTrips: 2, allTimeTrips: 7 });
  });

  it('hides Previous/Next when everything fits on one page', async () => {
    api.list.mockResolvedValue(page([trip('t1', 'UP Diliman'), trip('t2', 'Cubao')]));
    renderWithProviders(<TripHistory />);
    await screen.findByText(/UP Diliman/);
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('shows the Estimated tag next to the distance in the trip details sheet', async () => {
    const user = userEvent.setup();
    api.list.mockResolvedValue(page([trip('t2', 'Cubao')]));
    renderWithProviders(<TripHistory />);
    await user.click(await screen.findByRole('button', { name: /Trip to Cubao/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Trip details' });
    expect(within(dialog).getByText('Estimated')).toBeInTheDocument();
    expect(within(dialog).getByText(/12\.40 km/)).toBeInTheDocument();
  });
});
