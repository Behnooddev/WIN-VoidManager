import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CustomField, CustomFieldValue, FieldType } from '@prisma/client';

@Injectable()
export class CustomFieldService {
  constructor(private readonly prisma: PrismaService) {}

  async createField(data: { name: string; type: FieldType; isRequired?: boolean }) {
    return this.prisma.customField.create({
      data,
    });
  }

  async updateField(id: string, data: { name?: string; type?: FieldType; isRequired?: boolean }) {
    return this.prisma.customField.update({
      where: { id },
      data,
    });
  }

  async deleteField(id: string) {
    return this.prisma.customField.delete({
      where: { id },
    });
  }

  async getAllFields() {
    return this.prisma.customField.findMany();
  }

  async setFieldValue(employeeId: string, fieldId: string, value: any) {
    const field = await this.prisma.customField.findUnique({
      where: { id: fieldId },
    });

    if (!field) throw new NotFoundException('Custom field not found');

    this.validateValue(field.type, value);

    return this.prisma.customFieldValue.upsert({
      where: {
        fieldId_employeeId: { fieldId, employeeId },
      },
      update: { value: String(value) },
      create: {
        fieldId,
        employeeId,
        value: String(value),
      },
    });
  }

  async getEmployeeCustomValues(employeeId: string) {
    return this.prisma.customFieldValue.findMany({
      where: { employeeId },
      include: { field: true },
    });
  }

  private validateValue(type: FieldType, value: any) {
    if (value === null || value === undefined) return;

    switch (type) {
      case FieldType.NUMBER:
        if (isNaN(Number(value))) {
          throw new BadRequestException(`Field must be a number`);
        }
        break;
      case FieldType.BOOLEAN:
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          throw new BadRequestException(`Field must be a boolean`);
        }
        break;
      case FieldType.DATE:
        if (isNaN(Date.parse(value))) {
          throw new BadRequestException(`Field must be a valid date`);
        }
        break;
      case FieldType.URL:
        try {
          new URL(value);
        } catch {
          throw new BadRequestException(`Field must be a valid URL`);
        }
        break;
    }
  }
}
