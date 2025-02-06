import { IsEmail } from 'class-validator';

export class SendEmailMessage {
  @IsEmail()
  to: string;
}
