import { Module } from '@nestjs/common';
import { BaseUploadService } from './base.service';
import { BaseUploadController } from './base.controller';

@Module({
  imports: [],
  controllers: [BaseUploadController],
  providers: [BaseUploadService],
})
export class BaseUploadModule {}

