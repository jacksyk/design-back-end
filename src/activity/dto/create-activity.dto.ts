import { isNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

import { IsString } from 'class-validator';

export class CreateActivityDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  tags: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  start_time: Date;

  @IsNotEmpty()
  @IsNumber()
  end_time: Date;
}
