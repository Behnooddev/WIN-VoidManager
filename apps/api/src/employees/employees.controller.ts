import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { EmployeeService } from './employees.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';
import { RoleService } from '../roles/roles.service';

@Controller('employees')
@UseGuards(SessionGuard)
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly roleService: RoleService,
  ) {}

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.read')
  async list(@Body() body: any) {
    // Using @Body for search/pagination in GET is weird but for simplicity in this step.
    // Normally use @Query.
    return this.employeeService.listEmployees(body);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'];

    // Check if user is the employee themselves
    const myEmployee = await this.employeeService.findEmployeeByUserId(user.userId);
    if (myEmployee && myEmployee.id === id) {
      return this.employeeService.findEmployeeById(id);
    }

    // Otherwise, check for admin permission
    const hasPerm = await this.roleService.hasPermission(user.userId, 'employee.read');
    if (!hasPerm) {
      throw new ForbiddenException('You do not have permission to view this profile');
    }

    return this.employeeService.findEmployeeById(id);
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.create')
  async create(@Body() body: any) {
    return this.employeeService.createEmployee(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = req['user'];

    const myEmployee = await this.employeeService.findEmployeeByUserId(user.userId);
    const isOwner = myEmployee && myEmployee.id === id;

    const hasAdminPerm = await this.roleService.hasPermission(user.userId, 'employee.update');

    if (!isOwner && !hasAdminPerm) {
      throw new ForbiddenException('You do not have permission to update this profile');
    }

    // Note: if isOwner, we should filter out 'internalNotes' and 'status'
    // to prevent employees from promoting themselves.
    if (isOwner) {
      delete body.internalNotes;
      delete body.status;
      delete body.position; // Company manages position
    }

    return this.employeeService.updateEmployee(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.delete')
  async remove(@Param('id') id: string) {
    return this.employeeService.deleteEmployee(id);
  }

  @Post(':id/social')
  async addSocial(@Param('id') id: string, @Body() body: { platform: string; url: string }, @Req() req: Request) {
    const user = req['user'];
    const myEmployee = await this.employeeService.findEmployeeByUserId(user.userId);

    const isOwner = myEmployee && myEmployee.id === id;
    const hasAdminPerm = await this.roleService.hasPermission(user.userId, 'employee.update');

    if (!isOwner && !hasAdminPerm) {
      throw new ForbiddenException('Permission denied');
    }

    return this.employeeService.addSocialLink(id, body.platform, body.url);
  }

  @Delete(':id/social/:platform')
  async removeSocial(@Param('id') id: string, @Param('platform') platform: string, @Req() req: Request) {
    const user = req['user'];
    const myEmployee = await this.employeeService.findEmployeeByUserId(user.userId);

    const isOwner = myEmployee && myEmployee.id === id;
    const hasAdminPerm = await this.roleService.hasPermission(user.userId, 'employee.update');

    if (!isOwner && !hasAdminPerm) {
      throw new ForbiddenException('Permission denied');
    }

    return this.employeeService.removeSocialLink(id, platform);
  }
}
