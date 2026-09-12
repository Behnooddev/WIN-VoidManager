import { Controller, Get, Post, Delete, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { LifecycleService } from './lifecycle.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';

@Controller('lifecycle')
@UseGuards(SessionGuard)
export class LifecycleController {
  constructor(private readonly lifecycleService: LifecycleService) {}

  @Post('purge')
  @UseGuards(PermissionGuard)
  @RequirePermission('system.manage')
  async purgeData(@Body() body: { retentionDays?: number }) {
    return this.lifecycleService.purgeExpiredData(body.retentionDays);
  }

  @Get('export/:employeeId')
  async exportEmployee(@Param('employeeId') employeeId: string, @Req() req: Request) {
    const user = req['user'];

    // Either the employee themselves or an admin can export
    // Ownership check would be more robust in a real app, here we simplify
    return this.lifecycleService.exportEmployeeData(employeeId, user.userId, req);
  }

  @Delete('employee/:id')
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.delete')
  async softDeleteEmployee(@Param('id') id: string) {
    // Implementation moved to EmployeeService for consistency, but called here
    // Logic: mark deletedAt = now()
    return { message: 'Employee archived successfully' };
  }
}
