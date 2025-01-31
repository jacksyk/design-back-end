import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';

@Entity({
  name: 'user_activities',
})
export class UserActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userActivities)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;

  @ManyToOne(() => Activity, (activity) => activity.userActivities)
  @JoinColumn({
    name: 'activity_id',
    referencedColumnName: 'id',
  })
  activity: Activity;

  @Column({
    name: 'is_liked',
    type: 'tinyint',
    default: 0,
    comment: '是否点赞',
  })
  isLiked: number;

  @Column({
    name: 'is_collected',
    type: 'tinyint',
    default: 0,
    comment: '是否收藏',
  })
  isCollected: number;

  @Column({
    name: 'is_viewed',
    type: 'tinyint',
    default: 0,
    comment: '是否观看',
  })
  isViewed: number;

  @CreateDateColumn({
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;
}
