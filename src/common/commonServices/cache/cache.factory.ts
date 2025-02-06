import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './cache.types';

export const cacheClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    // TODO move redis url to process.env
    const client = createClient({ url: 'redis://localhost:6379/0' });
    try {
      await client.connect();
    } catch (err) {
      if (process.env.RUN_WITHOUT_CACHE === 'TRUE') {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return { on: () => {} } as unknown as RedisClient;
      }
      throw err;
    }
    return client;
  },
};
