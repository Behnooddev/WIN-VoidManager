import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DepartmentService } from './departments.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';

@Controller('departments')
@UseGuards(SessionGuard, PermissionGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @RequirePermission('employee.read')
  async findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @RequirePermission('employee.read')
  async findOne(@Param('id') id: string) {
    return this.departmentService.findById(id);
  }

  @Post()
  @RequirePermission('employee.create')
  async create(@Body() body: { name: string }) {
    return this.departmentService.create(body.name);
  }

  @Put(':id')
  @RequirePermission('employee.update')
  async update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.departmentService.update(id, body.name);
  }

  @Delete(':id')
  @RequirePermission('employee.delete')
  async remove(@Param('id') id: string) {
    return this.departmentService.delete(id);
  }
}
