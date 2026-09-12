import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageProvider } from '../storage/storage.provider';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('STORAGE_PROVIDER') private readonly storage: StorageProvider,
    private readonly auditService: AuditService,
  ) {}

  async uploadDocument(
    employeeId: string,
    categoryId: string,
    uploaderId: string,
    file: Express.Multer.File,
    request?: Request,
  ) {
    const storageKey = await this.storage.upload(file.buffer, file.originalname, file.mimetype);

    const doc = await this.prisma.document.create({
      data: {
        employeeId,
        categoryId,
        originalName: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        size: file.size,
        uploaderId,
      },
    });

    await this.auditService.logEvent({
      eventType: 'document.upload',
      actorId: uploaderId,
      targetId: doc.id,
      result: 'SUCCESS',
      metadata: { filename: file.originalname },
    }, request);

    return doc;
  }

  async getDocument(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!doc) throw new NotFoundException('Document not found');

    if (doc.employee.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this document');
    }

    return doc;
  }

  async getDocumentStream(id: string, userId: string, request?: Request) {
    const doc = await this.getDocument(id, userId);

    await this.auditService.logEvent({
      eventType: 'document.download',
      actorId: userId,
      targetId: id,
      result: 'SUCCESS',
    }, request);

    return this.storage.download(doc.storageKey);
  }

  async listDocuments(employeeId: string) {
    return this.prisma.document.findMany({
      where: { employeeId },
      include: { category: true },
    });
  }

  async deleteDocument(id: string, userId: string, request?: Request) {
    const doc = await this.getDocument(id, userId);

    await this.storage.delete(doc.storageKey);
    const result = await this.prisma.document.delete({
      where: { id },
    });

    await this.auditService.logEvent({
      eventType: 'document.delete',
      actorId: userId,
      targetId: id,
      result: 'SUCCESS',
    }, request);

    return result;
  }

  async getCategories() {
    return this.prisma.documentCategory.findMany();
  }

  async createCategory(name: string, actorId: string, request?: Request) {
    const category = await this.prisma.documentCategory.create({
      data: { name },
    });

    await this.auditService.logEvent({
      eventType: 'document.category.create',
      actorId,
      targetId: category.id,
      result: 'SUCCESS',
    }, request);

    return category;
  }
}
