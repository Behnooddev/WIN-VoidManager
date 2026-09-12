import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomFieldService } from './custom-fields.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';

@Controller('custom-fields')
@UseGuards(SessionGuard)
export class CustomFieldController {
  constructor(private readonly customFieldService: CustomFieldService) {}

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.read')
  async getAll() {
    return this.customFieldService.getAllFields();
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission('system.manage')
  async create(@Body() body: { name: string; type: any; isRequired?: boolean }) {
    return this.customFieldService.createField(body);
  }

  @Put(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('system.manage')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.customFieldService.updateField(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('system.manage')
  async remove(@Param('id') id: string) {
    return this.customFieldService.deleteField(id);
  }

  @Post('value')
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.update')
  async setValue(@Body() body: { employeeId: string; fieldId: string; value: any }) {
    return this.customFieldService.setFieldValue(body.employeeId, body.fieldId, body.value);
  }
}
