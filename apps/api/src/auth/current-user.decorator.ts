import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthedRequest, JwtPayload } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload =>
    ctx.switchToHttp().getRequest<AuthedRequest>().user,
);
