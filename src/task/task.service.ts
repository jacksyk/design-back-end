import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Activity } from '../../entities';
import { RedisClientType } from 'redis';
import { EntityManager } from 'typeorm';
import { UserActivity } from '../../entities';
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
      // 获取所有activity前缀的key, 存储活动 观看，点赞，收藏相关的数据
      const activityKeys = await this.redisClient.keys('activity:*');
      // 获取所有users前缀的key， 存储用户关于某篇文章的点赞，收藏相关数据
      const userKeys = await this.redisClient.keys('users:*');

      // 使用事务处理activity数据同步
      await this.manager.transaction(async (transactionalEntityManager) => {
        // 同步activity数据
        for (const key of activityKeys) {
          try {
            const [, id] = key.split(':');
            const data = await this.redisClient.hGetAll(key);

            if (Object.keys(data).length) {
              const { likes, views, collections } = data;
              const updateData: {
                views?: number;
                likes?: number;
                collections?: number;
              } = {
                views: undefined,
                likes: undefined,
                collections: undefined,
              };

              if (likes) {
                updateData.likes = parseInt(likes);
              }
              if (views) {
                updateData.views = parseInt(views);
              }
              if (collections) {
                updateData.collections = parseInt(collections);
              }

              await transactionalEntityManager.update(
                Activity,
                id,
                JSON.parse(JSON.stringify(updateData)),
              );
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
              const { likes, collections } = data;
              const updateData: {
                isLiked?: number;
                isCollected?: number;
              } = {
                isLiked: undefined,
                isCollected: undefined,
              };

              if (likes) {
                updateData['isLiked'] = parseInt(likes);
              }
              if (collections) {
                updateData['isCollected'] = parseInt(collections);
              }

              Logger.warn(updateData, 'updateData');

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
                  JSON.parse(JSON.stringify(updateData)),
                );
                continue;
              }

              if (user_id && activity_id) {
                await transactionalEntityManager.save(UserActivity, {
                  user: {
                    id: parseInt(user_id),
                  },
                  activity: {
                    id: parseInt(activity_id),
                  },
                  isLiked: likes ? +likes : 0,
                  isCollected: collections ? +collections : 0,
                });
              }
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

  // 发送邮件
  //   @Cron(CronExpression.EVERY_10_SECONDS)
  //   async handleSendEmail() {
  //     const htmlContent = `
  //     <div style="background-color: #f8f8f8; padding: 20px; font-family: 'SimSun', serif;">
  //       <div style="max-width: 800px; margin: 0 auto; background-color: #fff; border: 2px solid #8b0000; padding: 40px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  //         <div style="text-align: center; margin-bottom: 30px;">
  //           <img src="school_logo.png" alt="校徽" style="width: 100px; margin-bottom: 20px;">
  //           <h1 style="color: #8b0000; margin: 0; font-size: 36px; letter-spacing: 8px;">表 彰 书</h1>
  //         </div>
  //         <div style="color: #333; font-size: 18px; line-height: 2; text-align: justify;">
  //           <p style="text-indent: 2em; margin-bottom: 30px;">徐宜凡同学：</p>
  //           <p style="text-indent: 2em;">在过去的一年里，你以优异的学习成绩、突出的综合表现和卓越的领导才能，在我校学生中脱颖而出。经过严格评选，评为"2024年校园最佳大学生"。</p>
  //           <div style="background-color: #fff8f8; padding: 25px; border: 1px solid #8b0000; margin: 25px 0;">
  //             <p style="margin: 0; text-align: center; font-size: 20px; color: #8b0000;">
  //               主要事迹：<br>
  //               学业成绩优异，专业排名第一<br>
  //               多次获得国家级竞赛奖项<br>
  //               担任学生会主席，服务同学表现突出<br>
  //               在社会实践中展现卓越领导才能
  //             </p>
  //           </div>
  //           <p style="text-indent: 2em;">希望你再接再厉，继续发扬优良作风，为学校发展贡献力量，为同学们树立榜样。</p>
  //           <div style="text-align: right; margin-top: 50px;">
  //             <img src="stamp.png" alt="校章" style="width: 120px; margin-bottom: 20px;">
  //             <p style="margin: 5px 0;">湖北科技学院</p>
  //             <p style="margin: 5px 0;">二〇二五年二月六日</p>
  //           </div>
  //         </div>
  //         <div style="text-align: center; margin-top: 40px; border-top: 2px solid #f0f0f0; padding-top: 20px;">
  //           <p style="color: #666; font-size: 14px;">
  //             本表彰书由湖北科技学院学生工作处颁发
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  // `;
  //     const email = '2239121802@qq.com';

  //     await this.emailService.sendMail({
  //       to: email,
  //       html: htmlContent,
  //       subject: '湖北科技学院2024年度最佳大学生证书',
  //     });

  //     const data = await this.manager.findOne(Email, {
  //       where: {
  //         email,
  //       },
  //     });
  //     if (!data) {
  //       await this.manager.save(Email, {
  //         email,
  //         count: 1,
  //       });
  //       return;
  //     }
  //     await this.manager.update(
  //       Email,
  //       {
  //         email,
  //       },
  //       {
  //         count: data.count + 1,
  //       },
  //     );
  //     return;
  //   }
}
