import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '../users/users.module';
import { AccountThrottlerGuard, AuthGlobalThrottlerGuard } from './account-throttler.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { TokenService } from './token.service';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AccountThrottlerGuard,
    AuthGlobalThrottlerGuard,
    AuthService,
    TokenService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [TokenService, JwtAuthGuard, RolesGuard, UsersModule],
})
export class AuthModule {}
