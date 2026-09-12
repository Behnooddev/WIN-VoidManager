import { Module } from '@nestjs/common';
import { EmployeePortalController } from './employee-portal.controller';
import { EmployeeService } from '../employees/employees.service';
import { DocumentService } from '../documents/documents.service';

@Module({
  controllers: [EmployeePortalController],
  providers: [EmployeeService, DocumentService],
})
export class EmployeePortalModule {}
