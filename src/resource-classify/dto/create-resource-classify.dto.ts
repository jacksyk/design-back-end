import { IsOptional, IsString } from 'class-validator';

export class CreateResourceClassifyDto {
  @IsString()
  name: string; // 分类标签名称

  @IsString()
  @IsOptional()
  description: string; // 分类描述
}
