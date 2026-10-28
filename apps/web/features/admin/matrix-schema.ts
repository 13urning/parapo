import { z } from 'zod';

const num = (label: string, min: number, max: number) =>
  z
    .number({ invalid_type_error: `${label} must be a number`, required_error: `${label} is required` })
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be at most ${max}`);

/** Mirrors the contract's server-side validation ranges (the server re-validates). */
export const matrixSchema = z.object({
  vehicleType: z.enum(['TRADITIONAL_JEEPNEY', 'MODERN_JEEPNEY', 'UV_EXPRESS']),
  baseFare: num('Base fare', 1, 200),
  baseKm: num('Base distance', 1, 20),
  perKmRate: num('Per-km rate', 0, 50),
  discountPercent: num('Discount', 0, 100),
  effectiveDate: z.string().min(1, 'Choose an effective date'),
  notes: z.string().max(500, 'Notes are too long').optional(),
});
export type MatrixValues = z.infer<typeof matrixSchema>;
