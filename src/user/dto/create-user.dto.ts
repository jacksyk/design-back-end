import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  /** 学号 */
  student_id: string;
  @IsNotEmpty()

  /** 密码 */
  password: string;

  /** 邮箱 */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /** 验证码 */
  @IsNotEmpty()
  code: string;
}
