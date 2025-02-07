import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({
  // 表名
  name: 'email',
})
export class Email {
  /** 主键id */
  @PrimaryGeneratedColumn()
  id: number;

  /** 邮箱名 */
  @Column({
    name: 'email',
    length: 50,
    comment: '邮箱',
    nullable: true,
  })
  email: string;

  /** 计数 */
  @Column({
    name: 'count',
    comment: '计数',
    default: 0,
  })
  count: number;
}
