import { Module } from '@nestjs/common';
import { LifecycleService } from './lifecycle.service';
import { LifecycleController } from './lifecycle.controller';

@Module({
  controllers: [LifecycleController],
  providers: [LifecycleService],
  exports: [LifecycleService],
})
export class LifecycleModule {}
