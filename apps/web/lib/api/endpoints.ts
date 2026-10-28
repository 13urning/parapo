import { request } from './client';
import type {
  AnalyticsSummary,
  CreateTripInput,
  FareCategory,
  FareMatrix,
  FareMatrixInput,
  FareQuote,
  NotificationsResponse,
  Paginated,
  Place,
  PushSubscriptionInput,
  RouteResult,
  Trip,
  TripSummary,
  User,
  VehicleType,
} from './types';

export const authApi = {
  me: () => request<User>('/auth/me'),
  login: (body: { email: string; password: string }) => request<User>('/auth/login', { method: 'POST', body }),
  register: (body: { name: string; email: string; password: string; fareCategory: FareCategory }) =>
    request<User>('/auth/register', { method: 'POST', body }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};

export const placesApi = {
  search: (q: string, signal?: AbortSignal) => request<Place[]>('/places/search', { query: { q }, signal }),
  route: (from: [number, number], to: [number, number], signal?: AbortSignal) =>
    request<RouteResult>('/places/route', {
      query: { fromLat: from[0], fromLng: from[1], toLat: to[0], toLng: to[1] },
      signal,
    }),
};

export const faresApi = {
  quote: (vehicleType: VehicleType, distanceKm: number, fareCategory?: FareCategory) =>
    request<FareQuote>('/fares/quote', { query: { vehicleType, distanceKm, fareCategory } }),
};

export const tripsApi = {
  list: (page: number, pageSize: number) => request<Paginated<Trip>>('/trips', { query: { page, pageSize } }),
  summary: () => request<TripSummary>('/trips/summary'),
  create: (body: CreateTripInput) => request<Trip>('/trips', { method: 'POST', body }),
  remove: (id: string) => request<void>(`/trips/${id}`, { method: 'DELETE' }),
};

export const matricesApi = {
  list: (status?: string) => request<FareMatrix[]>('/fare-matrices', { query: { status } }),
  get: (id: string) => request<FareMatrix>(`/fare-matrices/${id}`),
  create: (body: FareMatrixInput) => request<FareMatrix>('/fare-matrices', { method: 'POST', body }),
  update: (id: string, body: Partial<FareMatrixInput>) =>
    request<FareMatrix>(`/fare-matrices/${id}`, { method: 'PATCH', body }),
  publish: (id: string) => request<FareMatrix>(`/fare-matrices/${id}/publish`, { method: 'POST' }),
  remove: (id: string) => request<void>(`/fare-matrices/${id}`, { method: 'DELETE' }),
};

export const notificationsApi = {
  list: () => request<NotificationsResponse>('/notifications'),
  markRead: (id: string) => request<void>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request<void>('/notifications/read-all', { method: 'POST' }),
  publicKey: () => request<{ publicKey: string }>('/notifications/push/public-key'),
  subscribe: (body: PushSubscriptionInput) => request<void>('/notifications/push/subscribe', { method: 'POST', body }),
  unsubscribe: (endpoint: string) =>
    request<void>('/notifications/push/unsubscribe', { method: 'POST', body: { endpoint } }),
};

export const analyticsApi = {
  summary: (days = 14) => request<AnalyticsSummary>('/analytics/summary', { query: { days } }),
};
