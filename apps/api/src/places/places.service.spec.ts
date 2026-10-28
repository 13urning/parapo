import { AppConfig } from '../config/app-config';
import { haversineKm, PlacesService } from './places.service';

const config = {
  nominatimUserAgent: 'ParaPo/1.0 (tech exam)',
  nominatimBaseUrl: 'https://nominatim.example',
  osrmBaseUrl: 'https://osrm.example',
} as AppConfig;

const from: [number, number] = [14.5995, 120.9842];
const to: [number, number] = [14.676, 121.0437];

describe('PlacesService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('falls back to haversine x 1.3 (estimated) when OSRM fails', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));
    const r = await new PlacesService(config).route(from, to);
    expect(r.estimated).toBe(true);
    expect(r.durationMin).toBeNull();
    expect(r.geometry).toEqual([from, to]);
    expect(r.distanceKm).toBeCloseTo(haversineKm(from, to) * 1.3, 1);
  });

  it('falls back on a non-OK OSRM response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('nope', { status: 502 }));
    expect((await new PlacesService(config).route(from, to)).estimated).toBe(true);
  });

  it('uses OSRM when available and flips GeoJSON to [lat,lng]', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'Ok',
          routes: [
            {
              distance: 12345,
              duration: 1500,
              geometry: {
                coordinates: [
                  [120.98, 14.59],
                  [121.04, 14.67],
                ],
              },
            },
          ],
        }),
      ),
    );
    const svc = new PlacesService(config);
    const r = await svc.route(from, to);
    expect(r).toEqual({
      distanceKm: 12.35,
      durationMin: 25,
      estimated: false,
      geometry: [
        [14.59, 120.98],
        [14.67, 121.04],
      ],
    });
    await svc.route(from, to); // cached
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('sends the configured User-Agent to Nominatim and caps results', async () => {
    const spy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify([{ display_name: 'Manila', lat: '14.6', lon: '120.98' }])),
      );
    const places = await new PlacesService(config).search('Manila');
    expect(places).toEqual([{ label: 'Manila', lat: 14.6, lng: 120.98 }]);
    const init = spy.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['User-Agent']).toBe('ParaPo/1.0 (tech exam)');
  });
});
