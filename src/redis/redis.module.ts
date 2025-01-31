import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      /** 动态创建一个provider */
      async useFactory() {
        const client = createClient({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
