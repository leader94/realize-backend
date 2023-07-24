import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient } from './cache.types';

@Injectable()
export class CacheService implements OnModuleDestroy {
  public constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient
  ) {
    this.redis.on('connect', () => {
      console.log('Connected to our redis instance!');
    });
  }

  onModuleDestroy() {
    this.redis.quit();
  }

  public putEntity(key: string, val: string, options: { EX?: number }) {
    if (!key || !val) {
      throw new Error('Err: Mandatory key or val not found');
    }
    this.redis.set(key, val, { EX: options?.EX });
  }

  public async getEntity(key: string) {
    if (!key) {
      throw new Error('Err: Mandatory key not found');
    }
    const response = await this.redis.get(key);
    return response;
  }

  public async deleteEntity(key: string) {
    if (!key) {
      throw new Error('Err: Mandatory key not found');
    }
    this.redis.del(key);
  }
}
