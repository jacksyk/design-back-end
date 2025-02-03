import { IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  title: string; // 资源标题

  @IsString()
  category: string; // 资源分类

  @IsString()
  url: string; // 资源链接

  @IsOptional()
  @IsString()
  description: string; // 资源描述
}
