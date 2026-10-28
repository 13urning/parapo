import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PublicUser, toPublicUser, UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
import { TokenService } from './token.service';

export const BCRYPT_COST = 12;
export const INVALID_CREDENTIALS = 'Invalid email or password';

export interface AuthResult {
  user: PublicUser;
  token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private dummyHash?: Promise<string>;

  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    try {
      // Role is never taken from client input.
      const user = await this.users.create({
        name: dto.name,
        email,
        passwordHash,
        fareCategory: dto.fareCategory,
        role: 'COMMUTER',
      });
      return await this.issue(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    // Always run exactly one bcrypt compare so unknown email and wrong password cost the same.
    const hash = user?.passwordHash ?? (await this.getDummyHash());
    const ok = await bcrypt.compare(dto.password, hash);
    if (!user || !ok) {
      this.logger.warn('Failed login attempt');
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.issue(user);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return toPublicUser(user);
  }

  /** Server-side logout: bumps tokenVersion so every outstanding token stops working. */
  async logout(token: string | undefined): Promise<void> {
    const payload = await this.tokens.verify(token);
    if (payload) await this.users.revokeSessions(payload.sub, payload.ver);
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= bcrypt.hash('parapo-dummy-password', BCRYPT_COST);
    return this.dummyHash;
  }

  private async issue(user: User): Promise<AuthResult> {
    const token = await this.tokens.sign({
      sub: user.id,
      role: user.role,
      name: user.name,
      ver: user.tokenVersion,
    });
    return { user: toPublicUser(user), token };
  }
}
