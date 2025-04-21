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
import { Activity, Comment, UserActivity } from '../../entities';
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

    return {
      data: allActivity,
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

    const userId = request['user_id'];
    const userActivity = await this.manager.findOne(UserActivity, {
      where: {
        user: {
          id: userId,
        },
        activity: {
          id: activityId,
        },
      },
    });

    if (!userActivity) {
      return Object.assign(activity, {
        isCollected: false,
        isLiked: false,
      });
    }

    return Object.assign(activity, {
      isCollected: userActivity?.isCollected === 1,
      isLiked: userActivity?.isLiked === 1,
    });
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

  async searchByKeyword(keyword: string) {
    const data = await this.manager.find(Activity, {
      where: [{ title: Like(`%${keyword}%`) }],
      relations: ['user'],
      order: {
        created_at: 'DESC',
      },
    });

    return {
      data,
      totalCount: data.length,
    };
  }
}
