import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
