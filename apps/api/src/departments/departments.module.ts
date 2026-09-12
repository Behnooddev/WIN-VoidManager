import { Module } from '@nestjs/common';
import { DepartmentService } from './departments.service';
import { DepartmentController } from './departments.controller';

@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
