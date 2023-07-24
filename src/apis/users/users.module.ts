import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { CommonServices } from 'src/common/commonServices/commonServices.module';
import { UsersController } from './users.controller';
import { CacheModule } from 'src/common/commonServices/cache/cache.module';

@Module({
  imports: [CommonServices, CacheModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
