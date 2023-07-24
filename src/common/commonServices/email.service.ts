import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private MAIL_SETTINGS = {
    service: 'gmail',
    auth: {
      user: process.env.MAIL_EMAIL || 'weinspirehelp@gmail.com',
      pass: process.env.MAIL_PASSWORD || 'llsjnwmdvkdsfmkb',
    },
  };

  constructor() {
    this.transporter = createTransport(this.MAIL_SETTINGS);
  }

  public async sendEmail(params: { to: string; OTP: string }) {
    try {
      const info = await this.transporter.sendMail({
        from: this.MAIL_SETTINGS.auth.user,
        to: params.to,
        subject: 'Hello ✔ | TagIt',
        html: `
          <div
            class="container"
            style="max-width: 90%; margin: auto; padding-top: 20px"
          >
            <h2>Welcome to the club.</h2>
            <h4>You are officially In ✔</h4>
            <p style="margin-bottom: 30px;">Please enter the OTP to get started</p>
            <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
       </div>
        `,
      });
      return info;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
