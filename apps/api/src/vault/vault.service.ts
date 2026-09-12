import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../security/encryption.service';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Injectable()
export class CredentialVaultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly auditService: AuditService,
  ) {}

  async storeCredential(employeeId: string, label: string, secret: string, actorId: string, request?: Request) {
    const encrypted = await this.encryption.encryptValue(secret);

    const cred = await this.prisma.credential.upsert({
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

    await this.auditService.logEvent({
      eventType: 'credential.store',
      actorId,
      targetId: cred.id,
      result: 'SUCCESS',
      metadata: { label },
    }, request);

    return cred;
  }

  async revealCredential(id: string, actorId: string, request?: Request) {
    const cred = await this.prisma.credential.findUnique({
      where: { id },
    });

    if (!cred) throw new NotFoundException('Credential not found');

    const secret = this.encryption.decryptValue(
      cred.encryptedValue,
      cred.iv,
      cred.tag,
      cred.encryptedDEK,
      cred.dekIv,
      cred.dekTag,
    );

    await this.auditService.logEvent({
      eventType: 'credential.reveal',
      actorId,
      targetId: id,
      result: 'SUCCESS',
    }, request);

    return secret;
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

  async deleteCredential(id: string, actorId: string, request?: Request) {
    const cred = await this.prisma.credential.findUnique({
      where: { id },
    });
    if (!cred) throw new NotFoundException('Credential not found');

    const result = await this.prisma.credential.delete({
      where: { id },
    });

    await this.auditService.logEvent({
      eventType: 'credential.delete',
      actorId,
      targetId: id,
      result: 'SUCCESS',
    }, request);

    return result;
  }
}
