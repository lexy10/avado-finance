import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './email/email.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('send-test-email')
  async sendEmail(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    console.log('RRRRR: ', request.body);

    /*try {
      const { recipient, body } = request.body;
      console.log("RRRRR: ", request.body.recipient)
      await this.emailService.sendTestEmail(recipient, body);
      response.status(HttpStatus.OK).send({
        status: true,
        message: 'Email sent successfully',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: false,
        message: 'An error occurred while sending the email',
        error: error.message,
      });
    }*/
  }
}
