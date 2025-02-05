import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: false,
      requireTLS: true,
    });
  }

  async sendEmail(options: EmailOptions) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      ...options,
    };
    try {
      const result = await this.transporter.sendMail(mailOptions); // Corrected method: sendMail
      console.log('Email sent successfully', result);
    } catch (error) {
      console.log('Error sending email', error);
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
