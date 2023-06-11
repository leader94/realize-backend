import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { UtilityService } from './utility.service';

@Module({
  controllers: [],
  imports: [],
  providers: [UtilityService, DatabaseService, StorageService],
  exports: [UtilityService, DatabaseService, StorageService],
})
export class CommonServices {}
