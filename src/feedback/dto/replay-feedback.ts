import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
export class ReplayFeedbackDto {
  /** 回复内容 */
  @IsNotEmpty({
    message: '回复不能为空',
  })
  @IsString()
  reply: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  /** 反馈id */
  id: number;
}
