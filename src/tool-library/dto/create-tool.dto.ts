import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsUrl,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateToolDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '描述不能为空' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: '图标不能为空' })
  @IsString()
  icon: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true, message: '标签ID必须是数字' })
  tagIds: number[];

  @IsNotEmpty({ message: '链接不能为空' })
  @IsUrl({}, { message: '请输入有效的URL' })
  link: string;
}
