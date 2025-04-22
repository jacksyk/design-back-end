import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsUrl,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ToolType } from '../../../entities';

export class CreateToolDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '描述不能为空' })
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true, message: '标签ID必须是数字' })
  tagIds: number[];

  @IsNotEmpty({ message: '链接不能为空' })
  @IsUrl({}, { message: '请输入有效的URL' })
  link: string;

  @IsNotEmpty({ message: '文件类型不能为空' })
  @IsString({ message: '文件类型必须是字符串' })
  type: ToolType;
}
