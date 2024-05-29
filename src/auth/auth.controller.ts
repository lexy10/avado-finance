import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { raw, Request, response, Response } from 'express';
import { EmailService } from '../email/email.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Req() request: Request, @Res() response: Response) {
    try {
      const registeredUser = await this.authService.register(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Registration Successful',
        extras: 'Verification code sent to email address',
        ...registeredUser,
      });
    } catch (error) {
      response.status(HttpStatus.CONFLICT).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('login')
  async login(@Req() request: Request, @Res() response: Response) {
    try {
      const loggedUser = await this.authService.login(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Authentication Successful',
        ...loggedUser,
      });
    } catch (error) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        status: false,
        message: error.message,
      });
    }
    //return response
  }

  /*@Post('send-test-email')
  async sendEmail(@Req() request: Request, @Res() response: Response): Promise<void> {

      try {
        const { recipient, body } = request.body;
        const token = Math.floor(1000 + Math.random() * 9000).toString();
        await this.emailService.sendUserConfirmation({
          createdAt: undefined,
          id: 0,
          is_verified: false,
          password: "",
          phone_number: "",
          transaction_pin: 0,
          updatedAt: undefined,
          username: "",
          verification_code: "",
          email_address: "kinglexy10@gmail.com", full_name: "Olakunle Irantiola"}, token);
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
      }
    }*/

  @Post('verify')
  async verifyAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const verified = await this.authService.verifyAccount(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Verification Successful',
      });
    } catch (error) {
      response.json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Req() request: Request, @Res() response: Response) {
    try {
      const forgotPassword = await this.authService.forgotPassword(
        request.body,
      );
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Password reset request Successful',
      });
    } catch (e) {
      response.json({
        status: false,
        message: e.message,
      });
    }
  }

  @Post('verify-reset-password-token')
  async verifyResetPasswordToken(@Req() request: Request, @Res() response: Response) {
    try {
      const verifyResetPasswordToken = await this.authService.verifyResetPasswordToken(
          request.body,
      );
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Token Valid',
      });
    } catch (e) {
      response.json({
        status: false,
        message: e.message,
      });
    }
  }

  @Post('reset-password')
  async resetPassword(@Req() request: Request, @Res() response: Response) {
    try {
      const resetPassword = await this.authService.resetPassword(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Password reset successfully',
      });
    } catch (e) {
      response.json({
        status: false,
        message: e.message,
      });
    }
  }
}
