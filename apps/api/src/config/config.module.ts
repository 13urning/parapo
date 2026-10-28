import { Global, Module } from '@nestjs/common';
import { AppConfig, loadConfig } from './app-config';
import { SecretsService } from './secrets.service';

@Global()
@Module({
  providers: [{ provide: AppConfig, useFactory: () => loadConfig() }, SecretsService],
  exports: [AppConfig, SecretsService],
})
export class ConfigModule {}
