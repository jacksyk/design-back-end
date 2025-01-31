import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  /** 学号 */
  student_id: string;
  @IsNotEmpty()
  /** 密码 */
  password: string;
}
