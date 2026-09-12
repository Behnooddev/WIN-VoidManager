import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../security/encryption.service';

@Injectable()
export class CredentialVaultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async storeCredential(employeeId: string, label: string, secret: string) {
    const encrypted = await this.encryption.encryptValue(secret);

    return this.prisma.credential.upsert({
      where: {
        employeeId_label: { employeeId, label },
      },
      update: {
        encryptedValue: encrypted.encryptedValue,
        iv: encrypted.iv,
        tag: encrypted.tag,
        encryptedDEK: encrypted.encryptedDek,
        dekIv: encrypted.dekIv,
        dekTag: encrypted.dekTag,
      },
      create: {
        employeeId,
        label,
        encryptedValue: encrypted.encryptedValue,
        iv: encrypted.iv,
        tag: encrypted.tag,
        encryptedDEK: encrypted.encryptedDek,
        dekIv: encrypted.dekIv,
        dekTag: encrypted.dekTag,
      },
    });
  }

  async revealCredential(id: string) {
    const cred = await this.prisma.credential.findUnique({
      where: { id },
    });

    if (!cred) throw new NotFoundException('Credential not found');

    return this.encryption.decryptValue(
      cred.encryptedValue,
      cred.iv,
      cred.tag,
      cred.encryptedDEK,
      cred.dekIv,
      cred.dekTag,
    );
  }

  async listCredentials(employeeId: string) {
    return this.prisma.credential.findMany({
      where: { employeeId },
      select: {
        id: true,
        label: true,
        updatedAt: true,
      },
    });
  }

  async deleteCredential(id: string) {
    return this.prisma.credential.delete({
      where: { id },
    });
  }
}
