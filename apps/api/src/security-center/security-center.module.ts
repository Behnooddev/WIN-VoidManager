import { Module } from '@nestjs/common';
import { SecurityCenterController } from './security-center.controller';

@Module({
  controllers: [SecurityCenterController],
})
export class SecurityCenterModule {}
