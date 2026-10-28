import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { AppConfig } from '../config/app-config';

export interface Place {
  label: string;
  lat: number;
  lng: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number | null;
  estimated: boolean;
  geometry: [number, number][];
}

const TIMEOUT_MS = 5000;
const SEARCH_TTL_MS = 10 * 60 * 1000;
const ROUTE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE = 500;
const NOMINATIM_MIN_GAP_MS = 1000;
const DETOUR_FACTOR = 1.3;

class TtlCache<T> {
  private readonly map = new Map<string, { value: T; expires: number }>();

  get(key: string): T | undefined {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.map.size >= MAX_CACHE) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { value, expires: Date.now() + ttlMs });
  }
}

export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const round2 = (n: number) => Math.round(n * 100) / 100;

interface NominatimItem {
  display_name?: string;
  lat?: string;
  lon?: string;
}

interface OsrmResponse {
  code?: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
  }[];
}

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);
  private readonly searchCache = new TtlCache<Place[]>();
  private readonly routeCache = new TtlCache<RouteResult>();
  private nominatimQueue: Promise<unknown> = Promise.resolve();
  private lastNominatimCall = 0;

  constructor(private readonly config: AppConfig) {}

  /** Serialises Nominatim calls and spaces them at least 1 s apart (usage policy). */
  private throttleNominatim<T>(task: () => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const wait = this.lastNominatimCall + NOMINATIM_MIN_GAP_MS - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      this.lastNominatimCall = Date.now();
      return task();
    };
    const next = this.nominatimQueue.then(run, run);
    this.nominatimQueue = next.catch(() => undefined);
    return next;
  }

  async search(q: string): Promise<Place[]> {
    const query = q.trim();
    const key = query.toLowerCase();
    const cached = this.searchCache.get(key);
    if (cached) return cached;

    const url = new URL('/search', this.config.nominatimBaseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('countrycodes', 'ph');
    url.searchParams.set('limit', '5');

    try {
      const items = await this.throttleNominatim(async () => {
        const res = await fetch(url, {
          headers: { 'User-Agent': this.config.nominatimUserAgent, Accept: 'application/json' },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);
        return (await res.json()) as NominatimItem[];
      });
      const places = (Array.isArray(items) ? items : [])
        .map((i) => ({ label: i.display_name ?? '', lat: Number(i.lat), lng: Number(i.lon) }))
        .filter((p) => p.label && Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .slice(0, 5);
      this.searchCache.set(key, places, SEARCH_TTL_MS);
      return places;
    } catch (e) {
      this.logger.warn(`Place search failed: ${(e as Error).message}`);
      throw new ServiceUnavailableException('Place search is temporarily unavailable');
    }
  }

  async route(from: [number, number], to: [number, number]): Promise<RouteResult> {
    const key = [...from, ...to].map((n) => n.toFixed(5)).join(',');
    const cached = this.routeCache.get(key);
    if (cached) return cached;

    let result: RouteResult;
    try {
      const url = new URL(
        `/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}`,
        this.config.osrmBaseUrl,
      );
      url.searchParams.set('overview', 'simplified');
      url.searchParams.set('geometries', 'geojson');
      const res = await fetch(url, {
        headers: { 'User-Agent': this.config.nominatimUserAgent, Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`OSRM responded ${res.status}`);
      const body = (await res.json()) as OsrmResponse;
      const r = body.routes?.[0];
      if (body.code !== 'Ok' || !r || !Number.isFinite(r.distance)) {
        throw new Error('OSRM returned no route');
      }
      result = {
        distanceKm: round2(r.distance / 1000),
        durationMin: Number.isFinite(r.duration) ? Math.round(r.duration / 60) : null,
        estimated: false,
        geometry: r.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      };
    } catch (e) {
      this.logger.warn(`OSRM unavailable, using haversine estimate: ${(e as Error).message}`);
      return {
        distanceKm: round2(haversineKm(from, to) * DETOUR_FACTOR),
        durationMin: null,
        estimated: true,
        geometry: [from, to],
      };
    }
    this.routeCache.set(key, result, ROUTE_TTL_MS);
    return result;
  }
}
