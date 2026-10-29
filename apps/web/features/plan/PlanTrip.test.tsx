import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faresApi, matricesApi, placesApi, tripsApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import type { FareQuote, Place, VehicleType } from '@/lib/api/types';
import { renderWithProviders } from '@/tests/test-utils';
import { PlanTrip } from './PlanTrip';

const cubao: Place = { label: 'Cubao, Quezon City', lat: 14.62, lng: 121.05 };
const quiapo: Place = { label: 'Quiapo Church', lat: 14.6, lng: 120.98 };

vi.mock('@/lib/api/endpoints', () => ({
  placesApi: { route: vi.fn(), search: vi.fn() },
  faresApi: { quote: vi.fn() },
  tripsApi: { create: vi.fn() },
  matricesApi: { list: vi.fn() },
}));
vi.mock('next/link', () => ({ default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a> }));
// The autocomplete has its own tests; here a button stands in for choosing a place.
vi.mock('./PlaceCombobox', () => ({
  PlaceCombobox: ({ label, onChange }: { label: string; onChange: (p: Place) => void }) => (
    <button type="button" onClick={() => onChange(label === 'From' ? cubao : quiapo)}>
      Pick {label}
    </button>
  ),
}));
// Leaflet needs a real browser.
vi.mock('./TripMapLoader', () => ({ TripMapLoader: () => <div data-testid="map" /> }));

const route = vi.mocked(placesApi.route);
const quoteApi = vi.mocked(faresApi.quote);
const create = vi.mocked(tripsApi.create);
const matrices = vi.mocked(matricesApi.list);

const FARES: Record<VehicleType, { fare: number; regularFare: number } | null> = {
  TRADITIONAL_JEEPNEY: { fare: 15, regularFare: 18.75 },
  MODERN_JEEPNEY: { fare: 18, regularFare: 22.5 },
  UV_EXPRESS: { fare: 26, regularFare: 32.5 },
};

const makeQuote = (vehicleType: VehicleType, distanceKm: number, f: { fare: number; regularFare: number }): FareQuote => ({
  vehicleType,
  distanceKm,
  fareCategory: 'STUDENT',
  discountApplied: true,
  matrixId: `m-${vehicleType}`,
  matrixEffectiveDate: '2026-01-01',
  ...f,
});

async function chooseTrip(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Pick From' }));
  await user.click(screen.getByRole('button', { name: 'Pick To' }));
}

describe('PlanTrip', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    route.mockResolvedValue({ distanceKm: 6.8, durationMin: 22, estimated: false, geometry: [[14.62, 121.05], [14.6, 120.98]] });
    quoteApi.mockImplementation(async (v, d) => {
      const f = FARES[v];
      if (!f) throw new ApiError(404, 'No published fare matrix');
      return makeQuote(v, d, f);
    });
    matrices.mockResolvedValue([]);
    create.mockResolvedValue({} as never);
  });

  it('asks for a trip first and keeps the log button disabled', () => {
    renderWithProviders(<PlanTrip />);
    expect(screen.getByRole('heading', { name: 'Where to?' })).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log this trip' })).toBeDisabled();
    expect(quoteApi).not.toHaveBeenCalled();
  });

  it('quotes all three vehicle types for the resolved distance', async () => {
    renderWithProviders(<PlanTrip />);
    await chooseTrip(user);

    await screen.findByRole('radiogroup', { name: 'Choose a ride' });
    await waitFor(() => expect(quoteApi).toHaveBeenCalledTimes(3));
    expect(quoteApi.mock.calls.map((c) => c[0]).sort()).toEqual(['MODERN_JEEPNEY', 'TRADITIONAL_JEEPNEY', 'UV_EXPRESS']);
    for (const call of quoteApi.mock.calls) expect(call[1]).toBe(6.8);
    expect(await screen.findAllByTestId('fare')).toHaveLength(3);
    expect(screen.getAllByTestId('regular-fare').map((e) => e.textContent)).toEqual(['₱18.75', '₱22.50', '₱32.50']);
  });

  it('selects and tags the cheapest by default, and the pinned button carries its fare', async () => {
    renderWithProviders(<PlanTrip />);
    await chooseTrip(user);

    const cheapest = await screen.findByRole('radio', { name: /Jeepney, Traditional/ });
    await waitFor(() => expect(cheapest).toBeChecked());
    expect(screen.getAllByText('Cheapest')).toHaveLength(1);
    expect(within(cheapest.closest('label')!).getByText('Cheapest')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log this trip · ₱15.00' })).toBeEnabled();
  });

  it('lets the rider pick another ride and saves the trip with that vehicle', async () => {
    renderWithProviders(<PlanTrip />);
    await chooseTrip(user);

    await user.click(await screen.findByRole('radio', { name: /UV Express/ }));
    const log = screen.getByRole('button', { name: 'Log this trip · ₱26.00' });
    await user.click(log);

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create.mock.calls[0][0]).toEqual({
      originLabel: cubao.label,
      originLat: cubao.lat,
      originLng: cubao.lng,
      destLabel: quiapo.label,
      destLat: quiapo.lat,
      destLng: quiapo.lng,
      vehicleType: 'UV_EXPRESS',
      distanceKm: 6.8,
      estimated: false,
    });
    expect(await screen.findByRole('button', { name: 'Trip logged' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'your trip history' })).toHaveAttribute('href', '/trips');
  });

  it('shows "No published fare" for a vehicle without a matrix and never selects it', async () => {
    FARES.MODERN_JEEPNEY = null;
    try {
      renderWithProviders(<PlanTrip />);
      await chooseTrip(user);

      expect(await screen.findByText('No published fare')).toBeInTheDocument();
      const modern = screen.getByRole('radio', { name: /Modern jeepney, Aircon/ });
      expect(modern).toBeDisabled();
      expect(await screen.findAllByTestId('fare')).toHaveLength(2);
      expect(screen.getByRole('radio', { name: /Jeepney, Traditional/ })).toBeChecked();
    } finally {
      FARES.MODERN_JEEPNEY = { fare: 18, regularFare: 22.5 };
    }
  });

  it('keeps the estimated-distance fallback visible', async () => {
    route.mockResolvedValue({ distanceKm: 6.8, durationMin: null, estimated: true, geometry: [] });
    renderWithProviders(<PlanTrip />);
    await chooseTrip(user);

    expect(await screen.findByText('Estimated distance')).toBeInTheDocument();
    expect(screen.getByText(/Road routing was unavailable/)).toBeInTheDocument();
    await user.click(await screen.findByRole('radio', { name: /UV Express/ }));
    await user.click(screen.getByRole('button', { name: /Log this trip/ }));
    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][0].estimated).toBe(true);
  });

  it('traces the selected fare to its matrix and discount', async () => {
    matrices.mockResolvedValue([
      {
        id: 'm-TRADITIONAL_JEEPNEY',
        vehicleType: 'TRADITIONAL_JEEPNEY',
        baseFare: 13,
        baseKm: 4,
        perKmRate: 1.8,
        discountPercent: 20,
        effectiveDate: '2026-01-01',
        status: 'PUBLISHED',
        notes: null,
        publishedAt: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);
    renderWithProviders(<PlanTrip />);
    await chooseTrip(user);

    expect(await screen.findByText('−20%')).toBeInTheDocument();
    await user.click(screen.getByText('How this fare is worked out'));
    expect(screen.getByText('₱13.00 covers the first 4 km')).toBeInTheDocument();
    expect(screen.getByText(/Traditional jeepney, effective/)).toBeInTheDocument();
    expect(screen.getByText(/not an official LTFRB fare guide/)).toBeInTheDocument();
  });

  it('does not quote when both places are the same', async () => {
    renderWithProviders(<PlanTrip />);
    await user.click(screen.getByRole('button', { name: 'Pick From' }));
    // Same spot for both: the second pick resolves to the origin.
    quiapo.lat = cubao.lat;
    quiapo.lng = cubao.lng;
    try {
      await user.click(screen.getByRole('button', { name: 'Pick To' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Pick two different places');
      expect(quoteApi).not.toHaveBeenCalled();
    } finally {
      quiapo.lat = 14.6;
      quiapo.lng = 120.98;
    }
  });
});
