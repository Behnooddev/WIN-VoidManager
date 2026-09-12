import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';

@Controller('audit')
@UseGuards(SessionGuard, PermissionGuard)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('logs')
  @RequirePermission('audit.read')
  async getLogs(@Query('eventType') eventType?: string, @Query('targetId') targetId?: string) {
    const where = {
      ...(eventType && { eventType }),
      ...(targetId && { targetId }),
    };

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }
}
