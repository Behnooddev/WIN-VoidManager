import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const totalEmployees = await this.prisma.employee.count();
    const activeEmployees = await this.prisma.employee.count({
      where: { status: 'ACTIVE' },
    });

    const departmentDistribution = await this.prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      departments: departmentDistribution.map(d => ({
        name: d.name,
        count: d._count.employees,
      })),
    };
  }

  async getRecentActivity() {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    });
  }

  async getRecentlyUpdatedProfiles() {
    return this.prisma.employee.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { department: true },
    });
  }
}
