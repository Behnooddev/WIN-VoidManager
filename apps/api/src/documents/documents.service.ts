import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageProvider } from '../storage/storage.provider';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('STORAGE_PROVIDER') private readonly storage: StorageProvider,
  ) {}

  async uploadDocument(
    employeeId: string,
    categoryId: string,
    uploaderId: string,
    file: Express.Multer.File,
  ) {
    // 1. Upload to storage
    const storageKey = await this.storage.upload(file.buffer, file.originalname, file.mimetype);

    // 2. Save metadata to DB
    return this.prisma.document.create({
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
  }

  async getDocument(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!doc) throw new NotFoundException('Document not found');

    // Ownership check: User must be the employee or an admin (admin check handled in controller)
    if (doc.employee.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this document');
    }

    return doc;
  }

  async getDocumentStream(id: string, userId: string) {
    const doc = await this.getDocument(id, userId);
    return this.storage.download(doc.storageKey);
  }

  async listDocuments(employeeId: string) {
    return this.prisma.document.findMany({
      where: { employeeId },
      include: { category: true },
    });
  }

  async deleteDocument(id: string, userId: string) {
    const doc = await this.getDocument(id, userId);

    await this.storage.delete(doc.storageKey);
    return this.prisma.document.delete({
      where: { id },
    });
  }

  async getCategories() {
    return this.prisma.documentCategory.findMany();
  }

  async createCategory(name: string) {
    return this.prisma.documentCategory.create({
      data: { name },
    });
  }
}
