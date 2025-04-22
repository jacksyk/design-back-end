import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ToolLibraryTag } from './tool-library-tag.entity';

// 添加类型枚举
export enum ToolType {
  LINK = 'link', // 链接类型
  FILE = 'file', // 文件类型
}

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
    type: 'enum',
    enum: ToolType,
    default: ToolType.LINK,
    comment: '工具类型：链接或文件',
  })
  type: ToolType;

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
