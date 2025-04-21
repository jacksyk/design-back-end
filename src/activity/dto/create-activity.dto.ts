import { isNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

import { IsString } from 'class-validator';
import { ActivityType } from '../../../entities';

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
  @IsString()
  type: ActivityType;

  @IsNotEmpty()
  @IsNumber()
  start_time: Date;

  @IsNotEmpty()
  @IsNumber()
  end_time: Date;
}
