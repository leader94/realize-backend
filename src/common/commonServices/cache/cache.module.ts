import { Module } from '@nestjs/common';
import { cacheClientFactory } from './cache.factory';
import { CacheService } from './cache.service';

@Module({
  providers: [cacheClientFactory, CacheService],
  exports: [CacheService],
})
export class CacheModule {}
