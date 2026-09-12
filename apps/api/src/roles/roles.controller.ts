import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RoleService } from './roles.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';

@Controller('roles')
@UseGuards(SessionGuard, PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('roles')
  @RequirePermission('roles.read')
  async getRoles() {
    return this.roleService.getAllRoles();
  }

  @Get('permissions')
  @RequirePermission('roles.read')
  async getPermissions() {
    return this.roleService.getAllPermissions();
  }

  @Post('roles')
  @RequirePermission('roles.manage')
  async createRole(@Body() body: { name: string }) {
    return this.roleService.createRole(body.name);
  }

  @Post('permissions')
  @RequirePermission('roles.manage')
  async createPermission(@Body() body: { slug: string }) {
    return this.roleService.createPermission(body.slug);
  }

  @Post('roles/assign-permission')
  @RequirePermission('roles.manage')
  async assignPermission(@Body() body: { roleId: string; permissionId: string }) {
    return this.roleService.assignPermissionToRole(body.roleId, body.permissionId);
  }

  @Post('users/assign-role')
  @RequirePermission('users.manage')
  async assignRole(@Body() body: { userId: string; roleId: string }) {
    return this.roleService.assignRoleToUser(body.userId, body.roleId);
  }
}
