import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In, Like, Or } from 'typeorm'; // 添加 Like, Or 导入
import { Activity, User, UserActivity, UserRole } from '../../entities';
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
    const [data, count] = await this.manager.findAndCount(User, {
      where: {
        role: In([UserRole.USER, UserRole.TEACHER]),
      },
    });
    return {
      data,
      totalCount: count,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { student_id, email, password, code } = createUserDto;
    const isExist = await this.manager.findOne(User, {
      where: { student_id },
    });

    if (isExist) {
      throw new BadRequestException('用户已存在');
    }

    const redisCode = await this.redisClient.get(`${email}:${code}`);

    if (redisCode !== code) {
      throw new BadRequestException('验证码错误');
    }

    const data = await this.manager.save(User, {
      student_id,
      email,
      password,
    });

    return data;
  }

  async findOne(id: number) {
    const data = await this.manager.findOne(User, {
      where: { id },
      relations: ['activities', 'comments', 'feedback'],
    });

    const [, collectionCount] = await this.manager.findAndCount(UserActivity, {
      where: {
        user: {
          id,
        },
        isCollected: 1,
      },
    });

    const [, likesCount] = await this.manager.findAndCount(UserActivity, {
      where: {
        user: {
          id,
        },
        isLiked: 1,
      },
    });

    if (!data) {
      throw new BadRequestException('用户不存在');
    }

    return {
      ...data,
      collectionCount,
      likesCount,
    };
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

  async ban(id: number) {
    const originData = await this.manager.findOne(User, {
      where: { id },
    });
    if (!originData) {
      throw new NotFoundException('用户不存在');
    }

    await this.manager.update(User, id, {
      ...originData,
      isActive: !originData.isActive,
    });
  }

  async search(keyword: string) {
    const [data, count] = await this.manager.findAndCount(User, {
      where: [
        { username: Like(`%${keyword}%`) },
        { student_id: Like(`%${keyword}%`) },
        { email: Like(`%${keyword}%`) },
        { college: Like(`%${keyword}%`) },
        { contact: Like(`%${keyword}%`) },
      ],
      order: {
        id: 'DESC',
      },
    });

    return {
      data,
      totalCount: count,
    };
  }

  async getIdentity(@Req() req: Request) {
    const userId = req['user_id'];
    const data = await this.manager.findOne(User, {
      where: userId,
    });
    return data;
  }

  /** 删除用户 */
  async remove(id: number) {
    await this.manager.delete(User, id);
    return '删除成功';
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

    // 使用事务处理点赞逻辑
    return await this.manager.transaction(
      async (transactionalEntityManager) => {
        // 查找用户活动关系
        const userActivity = await transactionalEntityManager.findOne(
          UserActivity,
          {
            where: {
              user: { id: user_id },
              activity: { id: activity_id },
            },
          },
        );

        if (!userActivity) {
          // 首次点赞
          await Promise.all([
            transactionalEntityManager.save(UserActivity, {
              user: { id: user_id },
              activity: { id: activity_id },
              isLiked: 1,
            }),
            transactionalEntityManager.update(Activity, activity_id, {
              likes: activity.likes + 1,
            }),
          ]);

          return {
            data: '1',
            message: '点赞成功',
          };
        } else {
          // 切换点赞状态
          const newLikeStatus = userActivity.isLiked === 1 ? 0 : 1;
          await Promise.all([
            transactionalEntityManager.update(UserActivity, userActivity.id, {
              isLiked: newLikeStatus,
            }),
            transactionalEntityManager.update(Activity, activity_id, {
              likes: activity.likes + (newLikeStatus === 1 ? 1 : -1),
            }),
          ]);

          return {
            data: newLikeStatus.toString(),
            message: newLikeStatus === 1 ? '点赞成功' : '取消点赞',
          };
        }
      },
    );
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

    // 使用事务处理收藏逻辑
    return await this.manager.transaction(
      async (transactionalEntityManager) => {
        const userActivity = await transactionalEntityManager.findOne(
          UserActivity,
          {
            where: {
              user: { id: user_id },
              activity: { id: activity_id },
            },
          },
        );

        if (!userActivity) {
          // 首次收藏
          await Promise.all([
            transactionalEntityManager.save(UserActivity, {
              user: { id: user_id },
              activity: { id: activity_id },
              isCollected: 1,
            }),
            transactionalEntityManager.update(Activity, activity_id, {
              collections: activity.collections + 1,
            }),
          ]);

          return {
            data: '1',
            message: '收藏成功',
          };
        } else {
          // 切换收藏状态
          const newCollectionStatus = userActivity.isCollected === 1 ? 0 : 1;
          await Promise.all([
            transactionalEntityManager.update(UserActivity, userActivity.id, {
              isCollected: newCollectionStatus,
            }),
            transactionalEntityManager.update(Activity, activity_id, {
              collections:
                activity.collections + (newCollectionStatus === 1 ? 1 : -1),
            }),
          ]);

          return {
            data: newCollectionStatus.toString(),
            message: newCollectionStatus === 1 ? '收藏成功' : '取消收藏',
          };
        }
      },
    );
  }

  async views(activity_id: number, @Req() req: Request) {
    // 先检查活动是否存在
    const activity = await this.manager.findOne(Activity, {
      where: { id: activity_id },
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    const user_id = req['user_id'];

    // 使用事务处理浏览逻辑
    return await this.manager.transaction(
      async (transactionalEntityManager) => {
        const userActivity = await transactionalEntityManager.findOne(
          UserActivity,
          {
            where: {
              user: { id: user_id },
              activity: { id: activity_id },
            },
          },
        );

        if (!userActivity) {
          // 首次浏览
          await Promise.all([
            transactionalEntityManager.save(UserActivity, {
              user: { id: user_id },
              activity: { id: activity_id },
              isViewed: 1,
            }),

            transactionalEntityManager.update(Activity, activity_id, {
              views: activity.views + 1,
            }),
          ]);
        } else {
          // 增加浏览次数
          await Promise.all([
            transactionalEntityManager.update(UserActivity, userActivity.id, {
              isViewed: userActivity.isViewed,
            }),
            transactionalEntityManager.update(Activity, activity_id, {
              views: activity.views + 1,
            }),
          ]);
        }

        return {
          data: '1',
          message: '浏览成功',
        };
      },
    );
  }
}
