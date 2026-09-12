import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LifecycleService {
  private readonly logger = new Logger('LifecycleService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Purges records that have been soft-deleted longer than the retention period.
   * This is typically called by a cron job.
   */
  async purgeExpiredData(retentionDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const results = {
      users: 0,
      employees: 0,
      documents: 0,
      credentials: 0,
    };

    try {
      results.users = await this.prisma.user.count({
        where: { deletedAt: { lte: cutoffDate } },
      });
      await this.prisma.user.deleteMany({
        where: { deletedAt: { lte: cutoffDate } },
      });

      results.employees = await this.prisma.employee.count({
        where: { deletedAt: { lte: cutoffDate } },
      });
      await this.prisma.employee.deleteMany({
        where: { deletedAt: { lte: cutoffDate } },
      });

      results.documents = await this.prisma.document.count({
        where: { deletedAt: { lte: cutoffDate } },
      });
      await this.prisma.document.deleteMany({
        where: { deletedAt: { lte: cutoffDate } },
      });

      results.credentials = await this.prisma.credential.count({
        where: { deletedAt: { lte: cutoffDate } },
      });
      await this.prisma.credential.deleteMany({
        where: { deletedAt: { lte: cutoffDate } },
      });

      this.logger.log(`Lifecycle purge completed: ${JSON.stringify(results)}`);
      return results;
    } catch (error) {
      this.logger.error(`Data purge failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generates a secure JSON export of an employee's data.
   */
  async exportEmployeeData(employeeId: string, actorId: string, request?: any) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
        department: true,
        socialLinks: true,
        customValues: { include: { field: true } },
        documents: { include: { category: true } },
      },
    });

    if (!employee) throw new Error('Employee not found');

    const exportData = {
      profile: employee,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    await this.auditService.logEvent({
      eventType: 'data.export',
      actorId,
      targetId: employeeId,
      result: 'SUCCESS',
      metadata: { format: 'json' },
    }, request);

    return JSON.stringify(exportData, null, 2);
  }
}
