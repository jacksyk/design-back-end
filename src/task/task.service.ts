import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Activity } from 'entities';
import { RedisClientType } from 'redis';
import { EntityManager } from 'typeorm';
import { UserActivity } from 'entities';
import { EmailService } from 'src/email/email.service';
@Injectable()
export class TaskService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  // 注入实体管理器
  @InjectEntityManager()
  private manager: EntityManager;

  @Inject(EmailService)
  private emailService: EmailService;

  // 将redis数据同步到数据库当中,hello
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    try {
      // 获取所有activity前缀的key
      const activityKeys = await this.redisClient.keys('activity:*');
      // 获取所有users前缀的key
      const userKeys = await this.redisClient.keys('users:*');

      // 使用事务处理activity数据同步
      await this.manager.transaction(async (transactionalEntityManager) => {
        // 同步activity数据
        for (const key of activityKeys) {
          try {
            const [, id] = key.split(':');
            const data = await this.redisClient.hGetAll(key);

            if (Object.keys(data).length) {
              const { likes = '0', views = '0', collections = '0' } = data;
              await transactionalEntityManager.update(Activity, id, {
                likes: parseInt(likes),
                views: parseInt(views),
                collections: parseInt(collections),
              });
            }
          } catch (err) {
            console.error(`同步activity数据失败: ${key}`, err);
            throw err; // 在事务中抛出错误以触发回滚
          }
        }

        // 同步user_activities数据
        for (const key of userKeys) {
          try {
            const [, user_id, activity_id] = key.split(':');
            const data = await this.redisClient.hGetAll(key);

            if (Object.keys(data).length) {
              const { likes = '0', collections = '0' } = data;
              const userActivity = await transactionalEntityManager.findOne(
                UserActivity,
                {
                  where: {
                    user: {
                      id: parseInt(user_id),
                    },
                    activity: {
                      id: parseInt(activity_id),
                    },
                  },
                },
              );

              if (userActivity) {
                await transactionalEntityManager.update(
                  UserActivity,
                  userActivity.id,
                  {
                    isLiked: +likes,
                    isCollected: +collections, // 添加 isCollected 的更新
                  },
                );
                continue;
              }

              await transactionalEntityManager.save(UserActivity, {
                user: {
                  id: parseInt(user_id),
                },
                activity: {
                  id: parseInt(activity_id),
                },
                isLiked: +likes,
                isCollected: +collections,
              });
            }
          } catch (err) {
            console.error(`同步user_activities数据失败: ${key}`, err);
            throw err; // 在事务中抛出错误以触发回滚
          }
        }
      });
    } catch (err) {
      console.error('同步数据失败:', err);
    }
  }
}
