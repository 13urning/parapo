import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppConfig } from '../config/app-config';

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * CSRF / content-type hardening for state-changing requests (global guard):
 * - Origin header, when present, must equal WEB_ORIGIN (403 otherwise).
 * - A request with a body must be application/json (415 otherwise). Bodiless requests pass.
 */
@Injectable()
export class RequestGuard implements CanActivate {
  constructor(private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (!WRITE_METHODS.has(req.method)) return true;

    const origin = req.headers.origin;
    if (origin !== undefined && origin !== this.config.webOrigin) {
      throw new ForbiddenException('Origin not allowed');
    }

    const length = Number(req.headers['content-length'] ?? 0);
    const hasBody = length > 0 || req.headers['transfer-encoding'] !== undefined;
    if (hasBody) {
      const type = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
      if (type !== 'application/json') {
        throw new UnsupportedMediaTypeException('Content-Type must be application/json');
      }
    }
    return true;
  }
}
