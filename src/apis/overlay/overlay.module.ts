import { Module } from '@nestjs/common';
import { OverlayUploadController } from './overlay.controller';

@Module({
  imports: [],
  controllers: [OverlayUploadController],
  providers: [],
})
export class TargetUploadModule {}
