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

  async likes(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'likes');
    if (getRedisValue) {
      const likes = parseInt(getRedisValue) + 1;
      await this.redisClient.hSet(key, 'likes', likes.toString());
      return {
        data: likes,
        message: '点赞成功',
      };
    }
    await this.redisClient.hSet(key, 'likes', '1');
    return {
      data: '1',
      message: '点赞成功',
    };
  }

  async views(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'views');
    if (getRedisValue) {
      const views = parseInt(getRedisValue) + 1;
      await this.redisClient.hSet(key, 'views', views.toString());
      return {
        data: views,
        message: '观看成功',
      };
    }
    await this.redisClient.hSet(key, 'views', '1');
    return {
      data: '1',
      message: '观看成功',
    };
  }

  async collections(id: number) {
    const key = `${this.prefix}:${id}`;
    const getRedisValue = await this.redisClient.hGet(key, 'collections');
    if (getRedisValue) {
      const collections = parseInt(getRedisValue) + 1;
      await this.redisClient.hSet(key, 'collections', collections.toString());
      return {
        data: collections,
        message: '收藏成功',
      };
    }
    await this.redisClient.hSet(key, 'collections', '1');
    return {
      data: '1',
      message: '收藏成功',
    };
  }
}
