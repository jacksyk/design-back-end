import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'resource_classify',
})
export class ResourceClassify {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  name: string; // 分类标签名称

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  description: string; // 分类描述

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date; // 创建时间
}
