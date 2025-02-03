import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({
  name: 'resource',
})
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string; // 资源标题

  @Column({
    type: 'varchar',
    length: 100,
  })
  category: string; // 资源分类

  @Column({
    type: 'varchar',
    length: 500,
  })
  url: string; // 资源链接

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string; // 资源描述

  @CreateDateColumn({
    type: 'timestamp',
  })
  uploadTime: Date; // 上传时间

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number; // 上传用户的ID
}
