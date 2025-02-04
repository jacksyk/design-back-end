import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty({
    message: '请输入反馈的内容',
  })
  @IsString()
  content: string; // 反馈的内容

  @IsNotEmpty({
    message: '请输入需要反馈的标题',
  })
  @IsString()
  title: string;
}
