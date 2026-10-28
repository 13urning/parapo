import { FareCategory, PrismaClient, VehicleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { calculateFare } from '../src/fares/fare-calculator';

const prisma = new PrismaClient();
const COST = 12;
const DAY = 24 * 60 * 60 * 1000;

const matrices: {
  id: string;
  vehicleType: VehicleType;
  baseFare: number;
  baseKm: number;
  perKmRate: number;
}[] = [
  {
    id: 'seed-matrix-traditional',
    vehicleType: 'TRADITIONAL_JEEPNEY',
    baseFare: 13,
    baseKm: 4,
    perKmRate: 1.8,
  },
  {
    id: 'seed-matrix-modern',
    vehicleType: 'MODERN_JEEPNEY',
    baseFare: 15,
    baseKm: 4,
    perKmRate: 2.2,
  },
  { id: 'seed-matrix-uv', vehicleType: 'UV_EXPRESS', baseFare: 2.4, baseKm: 1, perKmRate: 2.4 },
];

const trips = [
  {
    n: 1,
    o: 'Quiapo, Manila',
    oLat: 14.5995,
    oLng: 120.9842,
    d: 'University of the Philippines Diliman, Quezon City',
    dLat: 14.6538,
    dLng: 121.0685,
    v: 'TRADITIONAL_JEEPNEY',
    km: 11.2,
    est: false,
    ago: 1,
  },
  {
    n: 2,
    o: 'Cubao, Quezon City',
    oLat: 14.6197,
    oLng: 121.0509,
    d: 'SM North EDSA, Quezon City',
    dLat: 14.6565,
    dLng: 121.0299,
    v: 'MODERN_JEEPNEY',
    km: 5.4,
    est: true,
    ago: 3,
  },
  {
    n: 3,
    o: 'Ayala Avenue, Makati',
    oLat: 14.5547,
    oLng: 121.0244,
    d: 'Bonifacio Global City, Taguig',
    dLat: 14.5509,
    dLng: 121.0503,
    v: 'UV_EXPRESS',
    km: 4.1,
    est: false,
    ago: 6,
  },
] as const;

async function main(): Promise<void> {
  // Demo accounts/data are opt-in: never create known credentials unless explicitly requested.
  if (process.env.SEED_DEMO_DATA !== 'true') {
    console.log('SEED_DEMO_DATA is not "true"; skipping demo seed.');
    return;
  }
  // update: {} everywhere so re-running never overwrites changed passwords or edited data.
  await prisma.user.upsert({
    where: { email: 'admin@parapo.local' },
    update: {},
    create: {
      name: 'ParaPo Admin',
      email: 'admin@parapo.local',
      passwordHash: await bcrypt.hash('Admin#2026', COST),
      role: 'ADMIN',
      fareCategory: 'REGULAR',
    },
  });
  const juan = await prisma.user.upsert({
    where: { email: 'juan@parapo.local' },
    update: {},
    create: {
      name: 'Juan dela Cruz',
      email: 'juan@parapo.local',
      passwordHash: await bcrypt.hash('Commuter#2026', COST),
      role: 'COMMUTER',
      fareCategory: 'STUDENT',
    },
  });

  for (const m of matrices) {
    // Only seed a matrix when the vehicle type has no published one (admins may have replaced it).
    const published = await prisma.fareMatrix.findFirst({
      where: { vehicleType: m.vehicleType, status: 'PUBLISHED' },
    });
    if (published && published.id !== m.id) continue;
    await prisma.fareMatrix.upsert({
      where: { id: m.id },
      update: {},
      create: {
        ...m,
        discountPercent: 20,
        effectiveDate: new Date('2026-01-01T00:00:00Z'),
        status: 'PUBLISHED',
        publishedAt: new Date(),
        notes: 'Seeded LTFRB-style fare',
      },
    });
  }

  for (const t of trips) {
    const matrix = matrices.find((m) => m.vehicleType === t.v)!;
    const category: FareCategory = juan.fareCategory;
    const { fare } = calculateFare(t.km, { ...matrix, discountPercent: 20 }, category);
    await prisma.trip.upsert({
      where: { id: `seed-trip-${t.n}` },
      update: {},
      create: {
        id: `seed-trip-${t.n}`,
        userId: juan.id,
        originLabel: t.o,
        originLat: t.oLat,
        originLng: t.oLng,
        destLabel: t.d,
        destLat: t.dLat,
        destLng: t.dLng,
        vehicleType: t.v,
        distanceKm: t.km,
        estimated: t.est,
        fareCategory: category,
        fare,
        createdAt: new Date(Date.now() - t.ago * DAY),
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e: unknown) => {
    console.error('Seed failed:', e instanceof Error ? e.message : e);
    await prisma.$disconnect();
    process.exit(1);
  });
