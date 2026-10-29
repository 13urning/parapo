import type { FareCategory, MatrixStatus, VehicleType } from './api/types';

const php = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
export const formatPeso = (n: number) => php.format(n);
export const formatKm = (n: number) => `${n.toFixed(2)} km`;

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('en-PH', opts).format(d);
}

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  TRADITIONAL_JEEPNEY: 'Traditional jeepney',
  MODERN_JEEPNEY: 'Modern jeepney',
  UV_EXPRESS: 'UV Express',
};
export const VEHICLE_TYPES = Object.keys(VEHICLE_LABELS) as VehicleType[];

export const CATEGORY_LABELS: Record<FareCategory, string> = {
  REGULAR: 'Regular',
  STUDENT: 'Student',
  SENIOR: 'Senior citizen',
  PWD: 'Person with disability',
};
export const FARE_CATEGORIES = Object.keys(CATEGORY_LABELS) as FareCategory[];

export const STATUS_LABELS: Record<MatrixStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

/** One decimal, for the route strip ("6.8 km"). The fare itself always uses the full distance. */
export const formatKmShort = (n: number) => `${n.toFixed(1)} km`;

/** How each vehicle reads in the ride list. Descriptors are what is true of the vehicle type, not an ETA. */
export const VEHICLE_ROW: Record<VehicleType, { name: string; note: string }> = {
  TRADITIONAL_JEEPNEY: { name: 'Jeepney', note: 'Traditional' },
  MODERN_JEEPNEY: { name: 'Modern jeepney', note: 'Aircon' },
  UV_EXPRESS: { name: 'UV Express', note: 'Van' },
};

/** Local calendar day key, used to group the trip log. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "Today", "Yesterday", else "Mon, Oct 12". */
export function formatDayHeading(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
}
