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

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, UserModule, RoleModule, EmployeeModule, DepartmentModule, StorageModule, DocumentModule, VaultModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
