import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({
  name: 'feedback',
})
export class FeedBack {
  @PrimaryGeneratedColumn()
  id: number; // 反馈的唯一标识符

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({
    type: 'varchar',
    length: 500,
  })
  content: string; // 反馈的内容

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'resolved'],
    default: 'pending',
  })
  status: string; // 反馈状态

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  reply: string; // 管理员回复

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date; // 反馈的创建时间

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date; // 反馈的更新时间
}
