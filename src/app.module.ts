import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BaseUploadModule } from './apis/base/base.module';
import { TargetUploadModule } from './apis/overlay/overlay.module';
import { AuthModule } from './apis/auth/auth.module';
import { AppLoggerMiddleware } from './common/middlewares/AppLoggerMiddleware';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './apis/auth/jwt-auth.guard';
import { CommonServices } from './common/commonServices/commonServices.module';
import { SignedLinksModule } from './apis/signedLinks/signed-links.module';
import { UsersModule } from './apis/users/users.module';
import { ConfigsModule } from './apis/configs/configs.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    CommonServices,
    ConfigsModule,
    AuthModule,
    BaseUploadModule,
    TargetUploadModule,
    SignedLinksModule,
    UsersModule,
  ],
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
    // consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
