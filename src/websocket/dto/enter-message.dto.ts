import { IsString } from 'class-validator';

export class EnterMessageDto {
  @IsString()
  username: string;
}
