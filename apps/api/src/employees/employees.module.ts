import { Module } from '@nestjs/common';
import { EmployeeService } from './employees.service';
import { EmployeeController } from './employees.controller';
import { RoleService } from '../roles/roles.service';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
