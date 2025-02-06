import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { CommonModule } from 'src/common/commonServices/commonServices.module';
import { UsersController } from './users.controller';
import { CacheModule } from 'src/common/commonServices/cache/cache.module';

@Module({
  imports: [CommonModule, CacheModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
