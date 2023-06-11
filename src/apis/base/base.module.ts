import { Module } from '@nestjs/common';
import { BaseUploadService } from './base.service';
import { BaseUploadController } from './base.controller';
import { CommonServices } from 'src/common/commonServices/commonServices.module';

@Module({
  imports: [CommonServices],
  controllers: [BaseUploadController],
  providers: [BaseUploadService],
})
export class BaseUploadModule {}
