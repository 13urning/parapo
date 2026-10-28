export type Role = 'COMMUTER' | 'ADMIN';
export type FareCategory = 'REGULAR' | 'STUDENT' | 'SENIOR' | 'PWD';
export type VehicleType = 'TRADITIONAL_JEEPNEY' | 'MODERN_JEEPNEY' | 'UV_EXPRESS';
export type MatrixStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  fareCategory: FareCategory;
  createdAt: string;
}

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

export interface FareQuote {
  vehicleType: VehicleType;
  distanceKm: number;
  fareCategory: FareCategory;
  regularFare: number;
  discountApplied: boolean;
  fare: number;
  matrixId: string;
  matrixEffectiveDate: string;
}

export interface Trip {
  id: string;
  originLabel: string;
  destLabel: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  vehicleType: VehicleType;
  distanceKm: number;
  estimated: boolean;
  fareCategory: FareCategory;
  fare: number;
  createdAt: string;
}

export interface CreateTripInput {
  originLabel: string;
  originLat: number;
  originLng: number;
  destLabel: string;
  destLat: number;
  destLng: number;
  vehicleType: VehicleType;
  distanceKm: number;
  estimated: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface TripSummary {
  monthTotal: number;
  monthTrips: number;
  allTimeTrips: number;
}

export interface FareMatrix {
  id: string;
  vehicleType: VehicleType;
  baseFare: number;
  baseKm: number;
  perKmRate: number;
  discountPercent: number;
  effectiveDate: string;
  status: MatrixStatus;
  notes: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export type FareMatrixInput = Pick<
  FareMatrix,
  'vehicleType' | 'baseFare' | 'baseKm' | 'perKmRate' | 'discountPercent' | 'effectiveDate'
> & { notes?: string };

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  url: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  items: AppNotification[];
  unread: number;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface AnalyticsSummary {
  byPath: { path: string; views: number }[];
  byDay: { date: string; views: number }[];
  total: number;
}
