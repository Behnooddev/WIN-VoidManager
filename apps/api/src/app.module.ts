import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { RoleModule } from './roles/roles.module';
import { EmployeeModule } from './employees/employees.module';
import { DepartmentModule } from './departments/departments.module';
import { StorageModule } from './storage/storage.module';
import { DocumentModule } from './documents/documents.module';
import { VaultModule } from './vault/vault.module';
import { CustomFieldModule } from './custom-fields/custom-fields.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeePortalModule } from './portal/employee-portal.module';
import { SecurityCenterModule } from './security-center/security-center.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    UserModule,
    RoleModule,
    EmployeeModule,
    DepartmentModule,
    StorageModule,
    DocumentModule,
    VaultModule,
    CustomFieldModule,
    DashboardModule,
    EmployeePortalModule,
    SecurityCenterModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
