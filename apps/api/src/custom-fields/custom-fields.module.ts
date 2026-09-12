import { Module } from '@nestjs/common';
import { CustomFieldService } from './custom-fields.service';
import { CustomFieldController } from './custom-fields.controller';

@Module({
  controllers: [CustomFieldController],
  providers: [CustomFieldService],
  exports: [CustomFieldService],
})
export class CustomFieldModule {}
