import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { CommonServices } from 'src/common/commonServices/commonServices.module';
import { UsersController } from './users.controller';

@Module({
  imports: [CommonServices],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
