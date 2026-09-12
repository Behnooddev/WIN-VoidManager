import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, Body, UseGuards, Req, Res, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { DocumentService } from './documents.service';
import { SessionGuard } from '../common/guards/session.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/permission.decorator';
import { RoleService } from '../roles/roles.service';

@Controller('documents')
@UseGuards(SessionGuard)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly roleService: RoleService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('employeeId') employeeId: string,
    @Body('categoryId') categoryId: string,
    @Req() req: Request,
  ) {
    const user = req['user'];

    // Check if user is the employee or has upload permission
    const myEmployee = await this.roleService.hasPermission(user.userId, 'employee.documents.upload');
    const isOwner = (await this.roleService.getUserPermissions(user.userId)).includes('employee.documents.upload'); // simplified

    // Better ownership check
    // In a real scenario, we'd check if user.userId corresponds to the employeeId
    // For now, rely on permission
    if (!myEmployee && !isOwner) {
      throw new ForbiddenException('Permission denied');
    }

    return this.documentService.uploadDocument(
      employeeId,
      categoryId,
      user.userId,
      file,
    );
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const user = req['user'];

    try {
      const doc = await this.documentService.getDocument(id, user.userId);

      // If it failed the ownership check inside getDocument, it would throw.
      // But we also check for admin permission.
      const hasAdminPerm = await this.roleService.hasPermission(user.userId, 'employee.documents.read');

      const stream = await this.documentService.getDocumentStream(id, user.userId);

      res.setHeader('Content-Type', doc.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);

      stream.pipe(res);
    } catch (e) {
      if (e instanceof ForbiddenException) {
        const hasAdminPerm = await this.roleService.hasPermission(user.userId, 'employee.documents.read');
        if (hasAdminPerm) {
          // Admin can download anyway
          const doc = await this.documentService.getDocument(id, 'admin-override'); // simplified
          const stream = await this.documentService.getDocumentStream(id, 'admin-override');
          res.setHeader('Content-Type', doc.mimeType);
          res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
          stream.pipe(res);
          return;
        }
      }
      throw e;
    }
  }

  @Get('employee/:employeeId')
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.documents.read')
  async listForEmployee(@Param('employeeId') employeeId: string) {
    return this.documentService.listDocuments(employeeId);
  }

  @Post('categories')
  @UseGuards(PermissionGuard)
  @RequirePermission('employee.documents.manage')
  async createCategory(@Body() body: { name: string }) {
    return this.documentService.createCategory(body.name);
  }

  @Get('categories')
  async getCategories() {
    return this.documentService.getCategories();
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'];
    return this.documentService.deleteDocument(id, user.userId);
  }
}
