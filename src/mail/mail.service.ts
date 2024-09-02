/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'), 
      port: this.configService.get<number>('SMTP_PORT'), 
      secure: this.configService.get<string>('SMTP_SECURE'), 
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      connectionTimeout: 15000, // Optional: Increase if needed
      socketTimeout: 15000, // Optional: Increase if needed
    });
    
  }

  async sendWelcomeEmail(to: string, username: string, content: string) {
    const mailOptions = {
      from: `<${this.configService.get<string>('SMTP_USER')}>`,
      to: to,
      subject: 'Welcome to Doccure Care Service',
      text: `Hello ${username}`,
      html: this.getWelcomeTemplate(username, content),
    };
  
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Add more debugging info if needed
    }
  }
  

  private getWelcomeTemplate(username: string, content: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center;">
          <h2 style="color: #333;">Welcome to Doccure Care Service</h2>
        </div>
        <p>Dear <b>${username}</b>,</p>
        <p>${content}</p>
        <p>We are thrilled to have you on board. If you have any questions or need assistance, feel free to reach out to us at any time.</p>
        <p style="margin-top: 20px;">Best Regards,</p>
        <p><b>The Doccure Care Service Team</b></p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://yourwebsite.com" style="text-decoration: none; color: white; background-color: #007bff; padding: 10px 20px; border-radius: 5px;">Visit Our Website</a>
        </div>
      </div>
    `;
  }
}
