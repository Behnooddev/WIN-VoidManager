import { Controller, Get, Put, Post, UseGuards, Req, Body, ForbiddenException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { EmployeeService } from '../employees/employees.service';
import { SessionGuard } from '../common/guards/session.guard';
import { DocumentService } from '../documents/documents.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('portal')
@UseGuards(SessionGuard)
export class EmployeePortalController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly documentService: DocumentService,
  ) {}

  @Get('me')
  async getMyProfile(@Req() req: Request) {
    return this.employeeService.findEmployeeForSelf(req['user'].userId);
  }

  @Put('me')
  async updateMyProfile(@Req() req: Request, @Body() body: any) {
    const user = req['user'];
    const employee = await this.employeeService.findEmployeeByUserId(user.userId);

    return this.employeeService.updateEmployeeSelf(
      employee.id,
      body,
      user.userId,
      req,
    );
  }

  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('categoryId') categoryId: string,
    @Req() req: Request,
  ) {
    const user = req['user'];
    const employee = await this.employeeService.findEmployeeByUserId(user.userId);

    return this.documentService.uploadDocument(
      employee.id,
      categoryId,
      user.userId,
      file,
      req,
    );
  }
}
