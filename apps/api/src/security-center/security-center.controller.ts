import { Controller, Get, Delete, UseGuards, Req, Body, Param } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { SessionGuard } from '../common/guards/session.guard';

@Controller('security-center')
@UseGuards(SessionGuard)
export class SecurityCenterController {
  constructor(private readonly authService: AuthService) {}

  @Get('sessions')
  async getMySessions(@Req() req: Request) {
    return this.authService.getUserSessions(req['user'].userId);
  }

  @Delete('sessions/:sessionId')
  async revokeSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
    await this.authService.revokeSession(sessionId, req);
    return { message: 'Session revoked successfully' };
  }

  @Get('mfa-status')
  async getMfaStatus(@Req() req: Request) {
    // This would typically call the UserService to check the mfaEnabled flag
    return { mfaEnabled: false }; // placeholder
  }
}
