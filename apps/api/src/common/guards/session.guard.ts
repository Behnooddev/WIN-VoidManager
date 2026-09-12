import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { Request } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.['void_session'];

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    const session = await this.authService.validateSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach session data to request for use in controllers
    request['user'] = session;
    return true;
  }
}
