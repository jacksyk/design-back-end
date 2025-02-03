import { IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  password?: string;

  @IsOptional()
  username?: string;

  @IsEmail(undefined, {
    message: '邮箱格式错误',
  })
  @IsOptional()
  email?: string;

  @IsOptional()
  avatar?: string;
}
