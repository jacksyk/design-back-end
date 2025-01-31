import { Inject, Injectable, Query } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateActivityDto, GetQueryDto } from './dto';
import { Activity } from 'entities';
import { RedisClientType } from 'redis';

@Injectable()
export class ActivityService {
  // 注入实体管理器
  @InjectEntityManager()
  private manager: EntityManager;

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  private prefix: string;

  constructor() {
    this.prefix = 'activity';
  }

  create(createActivityDto: CreateActivityDto) {
    return this.manager.save(Activity, {
      ...createActivityDto,
    });
  }

  async findAll(@Query() query: GetQueryDto) {
    const { limit = 1, page = 1 } = query;
    const [allActivity, totalCount] = await this.manager.findAndCount(
      Activity,
      {
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
      },
    );
    return {
      data: allActivity,
      totalCount,
    };
  }

  async findOne(id: number) {
    const activity = await this.manager.findOne(Activity, {
      where: { id },
      relations: ['user'],
    });
    return activity;
  }

  async remove(id: number) {
    await this.manager.delete(Activity, id);
    return {
      message: '删除成功',
    };
  }

  /** 点赞 */
  async likes(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'likes');
    if (getRedisValue) {
      const likes = parseInt(getRedisValue) + 1;
      await this.redisClient.hSet(key, 'likes', likes.toString());
      return;
    }
    await this.redisClient.hSet(key, 'likes', '1');

    return;
  }

  /** 取消点赞 */
  async cancelLikes(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'likes');
    if (getRedisValue && getRedisValue !== '0') {
      const likes = parseInt(getRedisValue) - 1;
      await this.redisClient.hSet(key, 'likes', likes.toString());
      return;
    }
    await this.redisClient.hSet(key, 'likes', '0');
    return;
  }

  /** 增加数量 */
  async views(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'views');
    if (getRedisValue) {
      const views = parseInt(getRedisValue) + 1;
      await this.redisClient.hSet(key, 'views', views.toString());
      return;
    }
    await this.redisClient.hSet(key, 'views', '1');
    return;
  }

  /** 减少数量 */
  async cancelViews(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'views');
    if (getRedisValue && getRedisValue !== '0') {
      const views = parseInt(getRedisValue) - 1;
      await this.redisClient.hSet(key, 'views', views.toString());
      return;
    }
    await this.redisClient.hSet(key, 'views', '0');
    return;
  }

  /** 收藏数量 */
  async collections(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'collections');
    if (getRedisValue) {
      const collections = parseInt(getRedisValue) + 1;
      await this.redisClient.hSet(key, 'collections', collections.toString());
      return;
    }
    await this.redisClient.hSet(key, 'collections', '1');
    return;
  }

  /** 取消收藏 */
  async cancelCollections(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'collections');
    if (getRedisValue && getRedisValue !== '0') {
      const collections = parseInt(getRedisValue) - 1;
      await this.redisClient.hSet(key, 'collections', collections.toString());
      return;
    }
    await this.redisClient.hSet(key, 'collections', '0');
    return;
  }
}
