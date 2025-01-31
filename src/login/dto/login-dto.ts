import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  /** 学号 */
  student_id: string;
  @IsNotEmpty()
  /** 密码 */
  password: string;
}
