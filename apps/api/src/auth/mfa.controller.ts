import { Controller, Post, Body, Get, UseGuards, Req, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { MfaService } from './mfa.service';
import { UserService } from '../users/users.service';
import { SessionGuard } from '../common/guards/session.guard';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth/mfa')
@UseGuards(SessionGuard)
export class MfaController {
  constructor(
    private readonly mfaService: MfaService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('setup')
  async setupMfa(@Req() req: Request) {
    const userId = req['user'].userId;

    const { secret, qrCode } = await this.mfaService.generateMfaSecret();

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { secret, qrCode };
  }

  @Post('verify')
  async verifyMfa(@Body() body: { token: string }, @Req() req: Request) {
    const userId = req['user'].userId;
    const user = await this.userService.findById(userId);

    if (!user.mfaSecret) {
      throw new ForbiddenException('MFA is not set up');
    }

    const isValid = this.mfaService.verifyToken(body.token, user.mfaSecret);

    if (!isValid) {
      await this.auditService.logEvent({
        eventType: 'auth.mfa.failure',
        actorId: userId,
        result: 'FAILURE',
      }, req);
      throw new UnauthorizedException('Invalid MFA token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isMfaEnabled: true },
    });

    await this.auditService.logEvent({
      eventType: 'auth.mfa.enabled',
      actorId: userId,
      result: 'SUCCESS',
    }, req);

    return { message: 'MFA enabled successfully' };
  }
}
