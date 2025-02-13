import * as nodemailer from 'nodemailer';
import { ErrorHandler } from 'src/common/errorHandler.utils';

export async function SendMail(to: string, subject: string, text: string) {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
     ErrorHandler.handle(error)
  }
}
