import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';
import { CustomFieldService } from '../custom-fields/custom-fields.service';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly customFieldService: CustomFieldService,
  ) {}

  async createEmployee(data: Prisma.EmployeeCreateInput, actorId: string, request?: Request) {
    const employee = await this.prisma.employee.create({
      data,
      include: { socialLinks: true },
    });

    await this.auditService.logEvent({
      eventType: 'employee.create',
      actorId,
      targetId: employee.id,
      result: 'SUCCESS',
    }, request);

    return employee;
  }

  async updateEmployee(id: string, data: Prisma.EmployeeUpdateInput, actorId: string, request?: Request) {
    const employee = await this.prisma.employee.update({
      where: { id },
      data,
      include: { socialLinks: true },
    });

    await this.auditService.logEvent({
      eventType: 'employee.update',
      actorId,
      targetId: id,
      result: 'SUCCESS',
    }, request);

    return employee;
  }

  async deleteEmployee(id: string, actorId: string, request?: Request) {
    const employee = await this.prisma.employee.delete({
      where: { id },
    });

    await this.auditService.logEvent({
      eventType: 'employee.delete',
      actorId,
      targetId: id,
      result: 'SUCCESS',
    }, request);

    return employee;
  }

  async findEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        socialLinks: true,
        customValues: {
          include: { field: true }
        },
        manager: { select: { firstName: true, lastName: true } },
        user: { select: { email: true } }
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async findEmployeeByUserId(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        department: true,
        socialLinks: true,
        manager: { select: { firstName: true, lastName: true } }
      },
    });
    if (!employee) throw new NotFoundException('Employee profile not found for this user');
    return employee;
  }

  async listEmployees(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 20, search } = params;

    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take,
        include: { department: true },
        orderBy: { lastName: 'asc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: { total, skip, take },
    };
  }

  async addSocialLink(employeeId: string, platform: string, url: string, actorId: string, request?: Request) {
    const result = await this.prisma.employeeSocial.upsert({
      where: {
        employeeId_platform: { employeeId, platform },
      },
      update: { url },
      create: { employeeId, platform, url },
    });

    await this.auditService.logEvent({
      eventType: 'employee.social.update',
      actorId,
      targetId: employeeId,
      result: 'SUCCESS',
      metadata: { platform },
    }, request);

    return result;
  }

  async removeSocialLink(employeeId: string, platform: string, actorId: string, request?: Request) {
    const result = await this.prisma.employeeSocial.delete({
      where: {
        employeeId_platform: { employeeId, platform },
      },
    });

    await this.auditService.logEvent({
      eventType: 'employee.social.delete',
      actorId,
      targetId: employeeId,
      result: 'SUCCESS',
      metadata: { platform },
    }, request);

    return result;
  }
}
