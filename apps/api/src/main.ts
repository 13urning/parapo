import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { loadConfig } from './config/app-config';

async function bootstrap(): Promise<void> {
  const config = loadConfig(); // throws (fail closed) if DATABASE_URL is missing
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });

  // Behind the web proxy: throttling must key on the real client IP (X-Forwarded-For).
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.useBodyParser('json', { limit: '100kb' });
  app.use(cookieParser());
  app.enableCors({ origin: config.webOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableShutdownHooks();

  await app.listen(config.port, '0.0.0.0');
  new Logger('Bootstrap').log(`ParaPo API listening on :${config.port}`);
}

bootstrap().catch((err: unknown) => {
  new Logger('Bootstrap').error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
