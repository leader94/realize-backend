import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BaseUploadModule } from './apis/base/base.module';
import { TargetUploadModule } from './apis/overlay/overlay.module';

@Module({
  imports: [BaseUploadModule, TargetUploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
