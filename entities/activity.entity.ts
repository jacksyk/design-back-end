import { User } from './user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserActivity } from './user-activity.entity';
import { Comment } from './comment.entity';

@Entity({
  name: 'activity',
})
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'title',
    length: 100,
    comment: '活动标题',
  })
  title: string;

  @Column({
    name: 'description',
    type: 'text',
    comment: '活动描述',
  })
  description: string;

  @Column({
    name: 'start_time',
    type: 'timestamp',
    comment: '活动开始时间',
  })
  start_time: Date;

  @Column({
    name: 'end_time',
    type: 'timestamp',
    comment: '活动结束时间',
  })
  end_time: Date;

  // 自动创建时间
  @Column({
    name: 'created_at',
    type: 'timestamp',
    comment: '创建时间',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  // 自动更新时间
  @Column({
    name: 'updated_at',
    type: 'timestamp',
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP',
    /** 当数据库记录被更新时，这个字段会自动更新为当前的时间戳。 */
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;

  @Column({
    name: 'user_id',
    comment: '创建者id',
  })
  user_id: number;

  @Column({
    name: 'likes',
    type: 'int',
    comment: '点赞数',
    default: 0,
  })
  likes: number;

  @Column({
    name: 'views',
    type: 'int',
    comment: '观看数',
    default: 0,
  })
  views: number;

  @Column({
    name: 'collections',
    type: 'int',
    comment: '收藏数',
    default: 0,
  })
  collections: number;

  @Column({
    name: 'tags',
    type: 'varchar',
    length: 255,
    comment: '活动标签，多个标签用逗号分隔',
    nullable: true,
    default: '',
  })
  tags: string;

  @OneToMany(() => UserActivity, (userActivity) => userActivity.activity)
  userActivities: UserActivity[];

  @OneToMany(() => Comment, (comment) => comment.activityId)
  comments: Comment[];
}
