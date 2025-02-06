import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailMessage } from './dto/send-email-message';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async sendEmailMessage(@Body() body: SendEmailMessage) {
    const { to } = body;
    const code = '123456'; // 验证码应该是动态生成的

    const htmlContent = `
      <div style="background-color: #f6f6f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333; margin: 0;">邮箱验证</h1>
          </div>
          <div style="color: #666; font-size: 16px; line-height: 24px;">
            <p>您好！</p>
            <p>感谢您使用我们的服务。您的验证码是：</p>
            <div style="background-color: #f8f8f8; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="color: #2d8cf0; font-size: 24px; font-weight: bold; letter-spacing: 5px;">${code}</span>
            </div>
            <p>验证码有效期为5分钟，请勿泄露给他人。</p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              如果您没有请求此验证码，请忽略此邮件。
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
            <p>此邮件由系统自动发送，请勿直接回复</p>
          </div>
        </div>
      </div>
    `;

    await this.emailService.sendMail({
      to,
      subject: '刘家庆的工作驿站',
      html: htmlContent,
    });

    return '发送成功';
  }
}
