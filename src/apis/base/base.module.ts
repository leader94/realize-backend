import { Module } from '@nestjs/common';
import { BaseUploadService } from './base.service';
import { BaseUploadController } from './base.controller';
import { CommonModule } from 'src/common/commonServices/commonServices.module';

@Module({
  imports: [CommonModule],
  controllers: [BaseUploadController],
  providers: [BaseUploadService],
})
export class BaseUploadModule {}
