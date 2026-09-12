import { Module } from '@nestjs/common';
import { DocumentService } from './documents.service';
import { DocumentController } from './documents.controller';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
