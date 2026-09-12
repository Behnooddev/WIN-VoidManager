import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.department.create({
      data: { name },
    });
  }

  async update(id: string, name: string) {
    return this.prisma.department.update({
      where: { id },
      data: { name },
    });
  }

  async delete(id: string) {
    return this.prisma.department.delete({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }
}
