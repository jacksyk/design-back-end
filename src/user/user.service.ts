import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Activity, User } from 'entities';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisClientType } from 'redis';
import { ActivityService } from 'src/activity/activity.service';
@Injectable()
export class UserService {
  // 注入实体管理器
  @InjectEntityManager()
  private manager: EntityManager;

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  @Inject(ActivityService)
  private activityService: ActivityService;

  private prefix: string;

  constructor() {
    this.prefix = 'users';
  }

  async findAll() {
    const [data, count] = await this.manager.findAndCount(User);
    return {
      data,
      totalCount: count,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { student_id } = createUserDto;
    const isExist = await this.manager.findOne(User, {
      where: { student_id },
    });

    if (isExist) {
      throw new BadRequestException('用户已存在');
    }

    const data = await this.manager.save(User, createUserDto);

    return data;
  }

  async findOne(id: number) {
    const data = await this.manager.findOne(User, {
      where: { id },
      relations: ['activities', 'comments', 'feedback'],
    });

    if (!data) {
      throw new BadRequestException('用户不存在');
    }

    return data;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const originData = await this.manager.findOne(User, {
      where: { id },
    });

    if (!originData) {
      throw new NotFoundException('用户不存在');
    }

    await this.manager.update(
      User,
      id,
      Object.assign(originData, updateUserDto),
    );

    return '更新成功';
  }

  /** 删除用户 */
  remove(id: number) {
    return this.manager.delete(User, id);
  }

  async likes(activity_id: number, @Req() req: Request) {
    // 先检查活动是否存在
    const activity = await this.manager.findOne(Activity, {
      where: { id: activity_id },
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    const user_id = req['user_id'];
    const key = `${this.prefix}:${user_id}:${activity_id}`;

    let isLike = await this.redisClient.hGet(key, 'likes'); // 0 未点赞 1 已点赞

    if (isLike === null) {
      await this.redisClient.hSet(key, 'likes', '0');
    }

    isLike = await this.redisClient.hGet(key, 'likes');

    if (isLike === '0') {
      await this.redisClient.hSet(key, 'likes', '1');
      await this.activityService.likes(activity_id);
      return {
        data: '1',
        message: '点赞成功',
      };
    }

    await this.redisClient.hSet(key, 'likes', '0');
    await this.activityService.cancelLikes(activity_id);
    return {
      data: '0',
      message: '取消点赞',
    };
  }

  async collections(activity_id: number, @Req() req: Request) {
    // 先检查活动是否存在
    const activity = await this.manager.findOne(Activity, {
      where: { id: activity_id },
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    const user_id = req['user_id'];
    const key = `${this.prefix}:${user_id}:${activity_id}`;

    let isCollection = await this.redisClient.hGet(key, 'collections');

    if (isCollection === null) {
      await this.redisClient.hSet(key, 'collections', '0');
    }

    isCollection = await this.redisClient.hGet(key, 'collections');

    if (isCollection === '0') {
      await this.redisClient.hSet(key, 'collections', '1');
      await this.activityService.collections(activity_id);
      return {
        data: '1',
        message: '收藏成功',
      };
    }

    await this.redisClient.hSet(key, 'collections', '0');
    await this.activityService.cancelCollections(activity_id);
    return {
      data: '0',
      message: '取消收藏',
    };
  }

  async views(activity_id: number) {
    // 先检查活动是否存在
    const activity = await this.manager.findOne(Activity, {
      where: { id: activity_id },
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    await this.activityService.views(activity_id);

    return {
      data: '1',
      message: '浏览成功',
    };
  }
}
