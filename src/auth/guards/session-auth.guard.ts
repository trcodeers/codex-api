import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionRequest } from '../types/session-request.type';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<SessionRequest>();

    if (!request.session.userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    return true;
  }
}
