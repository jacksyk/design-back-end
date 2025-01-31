import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

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
}
