import { Injectable } from '@nestjs/common';
import { FareCategory, Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  fareCategory: FareCategory;
  createdAt: Date;
}

export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    fareCategory: u.fareCategory,
    createdAt: u.createdAt,
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getTokenVersion(id: string): Promise<number | null> {
    const u = await this.prisma.user.findUnique({ where: { id }, select: { tokenVersion: true } });
    return u ? u.tokenVersion : null;
  }

  /** Atomically increments tokenVersion only if the presented version is still current. */
  async revokeSessions(id: string, currentVersion: number): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id, tokenVersion: currentVersion },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
