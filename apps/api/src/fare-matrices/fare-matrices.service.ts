import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FareMatrix, MatrixStatus, Role, VehicleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../notifications/push.service';
import { CreateFareMatrixDto, UpdateFareMatrixDto } from './dto';

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  TRADITIONAL_JEEPNEY: 'Traditional jeepney',
  MODERN_JEEPNEY: 'Modern jeepney',
  UV_EXPRESS: 'UV Express',
};

export const toMatrixDto = (m: FareMatrix) => ({
  id: m.id,
  vehicleType: m.vehicleType,
  baseFare: m.baseFare,
  baseKm: m.baseKm,
  perKmRate: m.perKmRate,
  discountPercent: m.discountPercent,
  effectiveDate: m.effectiveDate,
  status: m.status,
  notes: m.notes,
  publishedAt: m.publishedAt,
  createdAt: m.createdAt,
});

@Injectable()
export class FareMatricesService {
  private readonly logger = new Logger(FareMatricesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  async list(role: Role, status?: MatrixStatus) {
    // Commuters only ever see PUBLISHED, whatever they ask for.
    const effective: MatrixStatus | undefined = role === 'ADMIN' ? status : 'PUBLISHED';
    const rows = await this.prisma.fareMatrix.findMany({
      where: effective ? { status: effective } : {},
      orderBy: [{ vehicleType: 'asc' }, { createdAt: 'desc' }],
    });
    return rows.map(toMatrixDto);
  }

  async get(id: string) {
    const m = await this.prisma.fareMatrix.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Fare matrix not found');
    return toMatrixDto(m);
  }

  async create(dto: CreateFareMatrixDto) {
    const m = await this.prisma.fareMatrix.create({
      data: { ...dto, effectiveDate: new Date(dto.effectiveDate), status: 'DRAFT' },
    });
    return toMatrixDto(m);
  }

  async update(id: string, dto: UpdateFareMatrixDto) {
    const existing = await this.prisma.fareMatrix.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Fare matrix not found');
    if (existing.status !== 'DRAFT') {
      throw new ConflictException('Only DRAFT fare matrices can be edited');
    }
    const { effectiveDate, ...rest } = dto;
    // Conditional on status so a concurrent publish cannot be edited after the check.
    const { count } = await this.prisma.fareMatrix.updateMany({
      where: { id, status: 'DRAFT' },
      data: { ...rest, ...(effectiveDate ? { effectiveDate: new Date(effectiveDate) } : {}) },
    });
    if (count === 0) throw new ConflictException('Only DRAFT fare matrices can be edited');
    return this.get(id);
  }

  async remove(id: string): Promise<void> {
    const { count } = await this.prisma.fareMatrix.deleteMany({ where: { id, status: 'DRAFT' } });
    if (count > 0) return;
    const exists = await this.prisma.fareMatrix.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Fare matrix not found');
    throw new ConflictException('Only DRAFT fare matrices can be deleted');
  }

  async publish(id: string) {
    const label = { current: '' };
    const published = await this.prisma.$transaction(async (tx) => {
      const draft = await tx.fareMatrix.findUnique({ where: { id } });
      if (!draft) throw new NotFoundException('Fare matrix not found');
      if (draft.status !== 'DRAFT') {
        throw new ConflictException('Only DRAFT fare matrices can be published');
      }
      await tx.fareMatrix.updateMany({
        where: { vehicleType: draft.vehicleType, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      });
      const m = await tx.fareMatrix.update({
        where: { id },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      });
      const users = await tx.user.findMany({ select: { id: true } });
      label.current = VEHICLE_LABELS[m.vehicleType];
      await tx.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          title: 'Fare update',
          body: `New ${label.current} fare matrix is now in effect.`,
          url: '/',
        })),
      });
      return m;
    });

    // Only after commit; fire-and-forget. PushService never rejects, but guard anyway.
    void this.push
      .sendToAll({
        title: 'Fare update',
        body: `New ${label.current} fare matrix is now in effect.`,
        url: '/',
      })
      .catch((e: unknown) =>
        this.logger.error(`Push after publish failed: ${(e as Error).message}`),
      );

    return toMatrixDto(published);
  }
}
