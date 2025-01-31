import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Activity } from 'entities';
import { RedisClientType } from 'redis';
import { EntityManager } from 'typeorm';

@Injectable()
export class TaskService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  // 注入实体管理器
  @InjectEntityManager()
  private manager: EntityManager;

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const keys = await this.redisClient.keys('activity*');
    for (const key of keys) {
      const value = await this.redisClient.hGet(key, 'likes');
      const collections = await this.redisClient.hGet(key, 'collections');
      const views = await this.redisClient.hGet(key, 'views');
      const id = key.split(':')[1];

      await this.manager.update(
        Activity,
        { id },
        {
          likes: Number(value),
          collections: Number(collections),
          views: Number(views),
        },
      );
    }
  }
}
