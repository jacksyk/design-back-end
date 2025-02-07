import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '2482693496@qq.com',
        pass: 'turshdctbcsdeadg',
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '校园信息交流平台',
        address: '2482693496@qq.com',
      },
      to,
      subject,
      html,
    });
  }
}
