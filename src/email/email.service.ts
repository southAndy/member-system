import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
    this.fromEmail =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') ?? '';
    this.frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') ?? ''
    ).replace(/\/+$/, '');
  }

  async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/auth/verify?token=${token}`;

    this.logger.debug(`Verification URL: ${verificationUrl}`);

    const msg = {
      to: email,
      from: this.fromEmail,
      subject: '請驗證您的 Email',
      html: `
        <h2>歡迎加入會員系統</h2>
        <p>請點擊下方連結驗證您的 Email：</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>如果您沒有註冊過，請忽略此信件。</p>
      `,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error,
      );
    }
  }
}
