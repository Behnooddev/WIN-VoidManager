import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: Prisma.EmployeeCreateInput) {
    return this.prisma.employee.create({
      data,
      include: { socialLinks: true },
    });
  }

  async updateEmployee(id: string, data: Prisma.EmployeeUpdateInput) {
    return this.prisma.employee.update({
      where: { id },
      data,
      include: { socialLinks: true },
    });
  }

  async deleteEmployee(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async findEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        socialLinks: true,
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

  async addSocialLink(employeeId: string, platform: string, url: string) {
    return this.prisma.employeeSocial.upsert({
      where: {
        employeeId_platform: { employeeId, platform },
      },
      update: { url },
      create: { employeeId, platform, url },
    });
  }

  async removeSocialLink(employeeId: string, platform: string) {
    return this.prisma.employeeSocial.delete({
      where: {
        employeeId_platform: { employeeId, platform },
      },
    });
  }
}
