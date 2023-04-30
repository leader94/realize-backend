import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BaseUploadModule } from './apis/base/base.module';
import { TargetUploadModule } from './apis/overlay/overlay.module';
import { AuthModule } from './apis/auth/auth.module';
import { AppLoggerMiddleware } from './common/middlewares/AppLoggerMiddleware';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './apis/auth/jwt-auth.guard';

@Module({
  imports: [AuthModule, BaseUploadModule, TargetUploadModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
