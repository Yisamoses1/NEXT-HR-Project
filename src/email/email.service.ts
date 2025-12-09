import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { createTransport, Transporter } from 'nodemailer'
import { ErrorHandler } from 'src/common/errorHandler.utils'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

@Injectable()
export class EmailService {
  private transporter: Transporter
  constructor() {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: false,
      requireTLS: true,
    })
  }

  async sendEmail(options: EmailOptions) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      ...options,
    }
    try {
      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully', result)
    } catch (error) {
      ErrorHandler.handle('Error sending email')
    }
  }
}
