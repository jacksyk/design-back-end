import {
  Body,
  Inject,
  Injectable,
  NotFoundException,
  Query,
  Req,
  Logger,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Like } from 'typeorm';
import { CreateActivityDto, GetQueryDto, SearchActivityDto } from './dto';
import { Activity, Comment, UserActivity } from 'entities';
import { RedisClientType } from 'redis';
import { isNull } from 'lodash';

@Injectable()
export class ActivityService {
  // 注入实体管理器
  @InjectEntityManager()
  private manager: EntityManager;

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  private prefix: string;

  private logger = new Logger(ActivityService.name);

  constructor() {
    this.prefix = 'activity';
  }

  create(createActivityDto: CreateActivityDto) {
    return this.manager.save(Activity, {
      ...createActivityDto,
    });
  }

  async findAll(@Query() query: GetQueryDto) {
    const { limit = 1, page = 1, isOrder = 'DESC', searchContent } = query;

    const where: any[] = [];

    if (searchContent) {
      where.push({
        title: Like(`%${searchContent}%`),
      });
      where.push({
        description: Like(`%${searchContent}%`),
      });
    }

    const [allActivity, totalCount] = await this.manager.findAndCount(
      Activity,
      {
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
        order: {
          created_at: isOrder,
        },
        where,
      },
    );

    // 获取每个活动的计数器数据
    const activitiesWithCounters = await Promise.all(
      allActivity.map(async (activity) => {
        const key = `activity:${activity.id}`;
        const counterFields = ['views', 'likes', 'collections'];
        const counters = await Promise.all(
          counterFields.map((field) => this.redisClient.hGet(key, field)),
        );

        const counterData = counterFields.reduce((acc, field, index) => {
          if (counters[index]) {
            acc[field] = parseInt(counters[index]);
          }
          return acc;
        }, {});

        return Object.assign(activity, counterData);
      }),
    );

    return {
      data: activitiesWithCounters,
      totalCount,
    };
  }

  async findOne(activityId: number, @Req() request: Request) {
    const activity = await this.manager.findOne(Activity, {
      where: { id: activityId },
      relations: ['user'],
    });

    if (!activity) {
      return new NotFoundException('活动未找到');
    }

    const status = await this.getStatus(activityId, request);

    this.logger.debug(status, '获取到的status');

    // 获取所有计数器
    const key = `activity:${activityId}`;
    const counterFields = ['views', 'likes', 'collections'];
    const counters = await Promise.all(
      counterFields.map((field) => this.redisClient.hGet(key, field)),
    );

    const counterData = counterFields.reduce((acc, field, index) => {
      if (counters[index]) {
        acc[field] = parseInt(counters[index]);
      }
      return acc;
    }, {});

    return Object.assign(activity, status, counterData);
  }

  async remove(id: number) {
    // 再删除活动
    const activity = await this.manager.findOne(Activity, {
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException('活动未找到');
    }

    // 开启事务
    await this.manager.transaction(async (transactionalEntityManager) => {
      // 先删除关联的评论
      await transactionalEntityManager.delete(Comment, { activityId: id });
      await transactionalEntityManager.remove(Activity, activity);
    });

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

  async findByUserId(@Req() request: Request) {
    console.log('>>>', request['user_id']);
    const userId = request['user_id'];
    const activity = await this.manager.find(Activity, {
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    console.log('activity', activity);

    return activity;
  }

  async search(@Body() searchActivityDto: SearchActivityDto) {
    const { searchContent } = searchActivityDto;
    const data = await this.manager.find(Activity, {
      where: [
        {
          title: Like(`%${searchContent}%`),
        },
        {
          description: Like(`%${searchContent}%`),
        },
      ],
    });

    return data;
  }

  async getStatus(activityId: number, @Req() request: Request) {
    const userId = request['user_id'];

    const propertyArray = ['likes', 'collections'];

    const [isLiked, isCollected] = await Promise.all(
      propertyArray.map((item) =>
        this.redisClient.hGet(`users:${userId}:${activityId}`, item),
      ),
    );

    this.logger.log(`users:${userId}:${activityId}`);

    this.logger.debug(isLiked, isCollected, 'status');

    // 都查不到的情况
    if (isNull(isLiked) && isNull(isCollected)) {
      this.logger.debug('都查不到的情况');
      const status = await this.manager.findOne(UserActivity, {
        where: {
          user: {
            id: request['user_id'],
          },
          activity: {
            id: activityId,
          },
        },
      });

      if (!status) {
        return {
          isLiked: false,
          isCollected: false,
        };
      }

      return {
        isLiked: status.isLiked === 1,
        isCollected: status.isCollected === 1,
      };
    }

    if (!isNull(isLiked) && isNull(isCollected)) {
      this.logger.debug('isLiked不为null,isCollected为null的情况');
      const status = await this.manager.findOne(UserActivity, {
        where: {
          user: {
            id: request['user_id'],
          },
        },
      });

      if (!status) {
        throw new NotFoundException('用户活动关系不存在');
      }

      return {
        isLiked: isLiked === '1',
        isCollected: status['isCollected'] === 1,
      };
    }

    if (isNull(isLiked) && !isNull(isCollected)) {
      this.logger.debug('isLiked为null,isCollected不为null的情况');
      const status = await this.manager.findOne(UserActivity, {
        where: {
          user: {
            id: request['user_id'],
          },
        },
      });

      if (!status) {
        throw new NotFoundException('用户活动关系不存在');
      }

      return {
        isLiked: status['isLiked'] === 1,
        isCollected: isCollected === '1',
      };
    }

    // 都不为null的情况
    if (!isNull(isLiked) && !isNull(isCollected)) {
      this.logger.debug('都不为null的情况');
      return {
        isLiked: isLiked === '1',
        isCollected: isCollected === '1',
      };
    }
  }
}
