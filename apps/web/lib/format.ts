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
