import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ToolLibraryTag } from './tool-library-tag.entity';

@Entity({
  name: 'tool_library',
})
export class ToolLibrary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '标题',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '描述',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '图标',
  })
  icon: string;

  @ManyToMany(() => ToolLibraryTag, (tag) => tag.tools)
  @JoinTable({
    name: 'tool_tags', // 中间表名称
    joinColumn: {
      name: 'tool_id', // 当前实体的外键配置
      referencedColumnName: 'id', // 引用 ToolLibrary 的哪个字段
    },
    inverseJoinColumn: {
      name: 'tag_id', // 在中间表中的列名
      referencedColumnName: 'id', // 引用 ToolLibraryTag 的哪个字段
    },
  })
  tags: ToolLibraryTag[];

  @Column({
    type: 'varchar',
    length: 255,
    comment: '链接地址',
  })
  link: string;
}
