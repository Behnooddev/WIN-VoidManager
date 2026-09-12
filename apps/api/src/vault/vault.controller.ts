import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { CredentialVaultService } from './vault.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';
import { RoleService } from '../roles/roles.service';

@Controller('vault')
@UseGuards(SessionGuard)
export class VaultController {
  constructor(
    private readonly vaultService: CredentialVaultService,
    private readonly roleService: RoleService,
  ) {}

  @Post('store')
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.credentials.create')
  async store(@Body() body: { employeeId: string; label: string; secret: string }, @Req() req: Request) {
    return this.vaultService.storeCredential(body.employeeId, body.label, body.secret, req['user'].userId, req);
  }

  @Get('reveal/:id')
  async reveal(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'];

    const hasPerm = await this.roleService.hasPermission(user.userId, 'employee.credentials.read');
    if (!hasPerm) {
      throw new ForbiddenException('You do not have permission to reveal secrets');
    }

    return {
      secret: await this.vaultService.revealCredential(id, user.userId, req),
    };
  }

  @Get('employee/:employeeId')
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.credentials.read')
  async list(@Param('employeeId') employeeId: string) {
    return this.vaultService.listCredentials(employeeId);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.credentials.delete')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.vaultService.deleteCredential(id, req['user'].userId, req);
  }
}
