process.env.DISABLE_AUTH_GUARD = 'TRUE';
process.env.RUN_WITHOUT_CACHE = 'TRUE';

import { NestFactory } from '@nestjs/core';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = new DocumentBuilder()
    .setTitle('Realize Backend Server')
    .setDescription('APIs description here')
    .setVersion('0.1')
    .addTag('realize')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  console.log('SERVER running on port: ', PORT);
}
bootstrap();
