import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { Auth, google } from 'googleapis';
import { existsSync, readFileSync } from 'fs';
import * as juice from 'juice';
import { render } from 'ejs';
import { htmlToText } from 'html-to-text';
import EmailData from './dtos/emailData.dto';

@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail;
  private logger = new Logger('EmailService');
  private oauthClient: Auth.OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    //   initializing nodemailer and gmail

    this.oauthClient = new google.auth.OAuth2(
      configService.get('GOOGLE_CLIENT_ID'),
      configService.get('GOOGLE_CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    this.oauthClient.setCredentials({
      refresh_token: configService.get('REFRESH_TOKEN'),
    });

    const accessToken = this.oauthClient.getAccessToken();

    this.nodemailerTransport = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'johndoe@example.com',
        clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
        refreshToken: configService.get('REFRESH_TOKEN'),
        accessToken,
      },
    });
  }

  async sendMail(options: Mail.Options) {
    try {
      const response = await this.nodemailerTransport.sendMail(options);
      this.nodemailerTransport.close();
      return response;
    } catch (error) {
      this.logger.error(error.code, error.stack);
      throw new InternalServerErrorException({
        message: "Nodemailer cant't send email",
      });
    }
  }

  async sendMailWithTemplate({
    template: templateName,
    templateVars,
    ...restOfOptions
  }) {
    const templatePath = `src/email/templates/${templateName}.html`;
    const options = {
      ...restOfOptions,
    };
    if (templateName && existsSync(templatePath)) {
      try {
        const template = readFileSync(templatePath, 'utf-8');
        const html = render(template, templateVars);
        const text = htmlToText(html);
        const htmlWithStylesInlined = juice(html);

        options.html = htmlWithStylesInlined;
        options.text = text;
        options.from = 'John Doe <johndoe@example.com>';
        options.replyTo = 'John Doe <johndoe@example.com>';

        return this.sendMail(options);
      } catch (error) {
        this.logger.error(error.stack, error.code);
      }
    }
  }

  async sendTestEmail(data: EmailData) {
    const mailOptions: any = { ...data };
    const response = await this.sendMailWithTemplate(mailOptions);
    if (!response) throw new BadRequestException({ message: 'Inavlid fields' });
    return response;
  }
}
