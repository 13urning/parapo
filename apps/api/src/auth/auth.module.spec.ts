import { Global, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppConfig } from '../config/app-config';
import { SecretsService } from '../config/secrets.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountThrottlerGuard } from './account-throttler.guard';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

@Global()
@Module({
  providers: [
    { provide: AppConfig, useValue: { cookieSecure: false } },
    { provide: SecretsService, useValue: {} },
    { provide: PrismaService, useValue: {} },
  ],
  exports: [AppConfig, SecretsService, PrismaService],
})
class StubInfraModule {}

describe('AuthModule wiring', () => {
  it('resolves the controller and its route-level throttler guard', async () => {
    const mod = await Test.createTestingModule({
      imports: [StubInfraModule, AuthModule],
    }).compile();
    expect(mod.get(AuthController)).toBeDefined();
    expect(mod.get(AccountThrottlerGuard)).toBeDefined();
  });
});
