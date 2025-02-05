import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Activity } from './activity.entity';
import { UserActivity } from './user-activity.entity';
import { Comment } from './comment.entity';
import { FeedBack } from './feedback.entity';
@Entity({
  // 表名
  name: 'users',
})
export class User {
  /** 主键id */
  @PrimaryGeneratedColumn()
  id: number;

  /** 用户姓名 */
  @Column({
    name: 'username',
    length: 50,
    comment: '用户名',
    nullable: true,
  })
  username: string;

  @Column({
    name: 'student_id',
    length: 20,
    comment: '学号',
    nullable: true,
  })
  student_id: string;

  @Column({
    name: 'password',
    length: 100,
    comment: '密码',
    nullable: true,
  })
  password: string;

  @Column({
    name: 'email',
    length: 50,
    comment: '邮箱',
    nullable: true,
  })
  email: string;

  /** 用户权限 */
  @Column({
    name: 'role',
    length: 20,
    comment: '用户权限',
    nullable: true,
    default: 'user',
  })
  role: string;

  /** 用户头像 */
  @Column({
    name: 'avatar',
    length: 255,
    comment: '用户头像URL',
    nullable: true,
  })
  avatar: string;

  /** 个人简介 */
  @Column({
    name: 'introduction',
    length: 255,
    comment: '个人简介',
    nullable: true,
  })
  introduction: string;

  /** 一对多 */
  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  /** 用户和活动关联 */
  @OneToMany(() => UserActivity, (userActivity) => userActivity.user)
  userActivities: UserActivity[];

  /** 用户和评论 */
  @OneToMany(() => Comment, (comment) => comment.userId)
  comments: Comment[];

  /** 用户建议 */
  @OneToMany(() => FeedBack, (feedback) => feedback.user)
  feedback: FeedBack[];
}
