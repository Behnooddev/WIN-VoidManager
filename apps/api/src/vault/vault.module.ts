import { Module } from '@nestjs/common';
import { CredentialVaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { EncryptionService } from '../security/encryption.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VaultController],
  providers: [CredentialVaultService, EncryptionService, PrismaService],
  exports: [CredentialVaultService],
})
export class VaultModule {}
