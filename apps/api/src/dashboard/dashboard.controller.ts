import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';

@Controller('dashboard')
@UseGuards(SessionGuard, PermissionGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @RequirePermission('employee.read')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('activity')
  @RequirePermission('audit.read')
  async getActivity() {
    return this.dashboardService.getRecentActivity();
  }

  @Get('recent-profiles')
  @RequirePermission('employee.read')
  async getRecentProfiles() {
    return this.dashboardService.getRecentlyUpdatedProfiles();
  }
}
