import { Body, Controller, Post } from '@nestjs/common';
import EmailData from './dtos/emailData.dto';
import EmailService from './__service';

@Controller('email')
export default class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('/test')
  sendTestEmail(@Body() emailData: EmailData) {
    return this.emailService.sendTestEmail(emailData);
  }
}
