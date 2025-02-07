import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetQueryDto {
  @Transform(({ value }) => Number(value))
  @IsNumber(undefined, {
    message: 'limit 必须是数字',
  })
  limit: number;

  @Transform(({ value }) => Number(value))
  @IsNumber(undefined, {
    message: 'page 必须是数字',
  })
  page: number;

  /** 如果传了这个条件，表示需要排序 */
  @IsOptional()
  @IsString()
  isOrder: 'DESC' | 'ASC';

  /** 根据条件来搜索 */
  @IsOptional()
  @IsString()
  searchContent: string;
}
