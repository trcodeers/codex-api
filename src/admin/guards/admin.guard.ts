import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../common/types/jwt-payload.type';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();

    if (request.user?.role !== 'Admin') {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}
