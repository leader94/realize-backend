import { Module } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';

@Module({
  providers: [ConfigsService],
  controllers: [ConfigsController],
})
export class ConfigsModule {}
