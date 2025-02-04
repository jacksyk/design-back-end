import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';

@Entity({
  name: 'comments',
})
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  userId: User;

  @ManyToOne(() => Activity, (activity) => activity.comments, {
    nullable: false,
  })
  @JoinColumn({
    name: 'activity_id',
    referencedColumnName: 'id',
  })
  activityId: Activity;

  @Column({
    type: 'text',
    comment: '评论内容',
    nullable: false,
  })
  content: string;

  @Column({
    name: 'likes_count',
    type: 'int',
    default: 0,
    comment: '点赞数',
  })
  likesCount: number;

  @CreateDateColumn({
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    comment: '更新时间',
  })
  updatedAt: Date;
}
