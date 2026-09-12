import { Controller, Post, Body, Get, UseGuards, Req, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { MfaService } from './mfa.service';
import { SessionGuard } from '../common/guards/session.guard';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response, @Req() req: Request) {
    const { email, password } = body;
    const result = await this.authService.login(email, password, req);

    if (result.mfaRequired) {
      return res.send({
        mfaRequired: true,
        mfaSessionId: result.mfaSessionId,
        message: 'Please provide your MFA token to complete login',
      });
    }

    res.cookie('void_session', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 * 1000,
    });

    return res.send({ message: 'Login successful' });
  }

  @Post('login/mfa')
  async loginMfa(@Body() body: { mfaSessionId: string; token: string }, @Res() res: Response, @Req() req: Request) {
    const { sessionId } = await this.authService.verifyMfaAndLogin(body.mfaSessionId, body.token, req);

    res.cookie('void_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 * 1000,
    });

    return res.send({ message: 'MFA login successful' });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.cookies?.['void_session'];
    if (sessionId) {
      await this.authService.logout(sessionId, req);
    }

    res.clearCookie('void_session');
    return res.send({ message: 'Logout successful' });
  }

  @Get('me')
  @UseGuards(SessionGuard)
  async me(@Req() req: Request) {
    return req['user'];
  }
}
