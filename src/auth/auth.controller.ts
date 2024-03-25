import {Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Req, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import {raw, Request, response, Response} from "express";
import {EmailService} from "../email/email.service";
import {UserEntity} from "../users/entities/user.entity";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly emailService: EmailService,
  ) {}

  @Post("register")
  async register(@Req() request: Request, @Res() response: Response) {
    const registeredUser = await this.authService.register(request.body);
    if (registeredUser) {
      response.status(HttpStatus.CREATED).send({
        status: true,
        message: "Registration Successful",
        extras: "Verification code sent to email address",
        token: registeredUser,
      }, )
    } else {
      response.status(HttpStatus.CONFLICT).send({
        status: false,
        message: 'Account already exists',
        data: registeredUser
      });
    }
  }

  @Post("login")
  async login(@Req() request: Request, @Res() response: Response) {
    const loggedUser = await this.authService.login(request.body);
    if (loggedUser) {
      response.status(HttpStatus.OK).send({
        status: true,
        message: 'Authentication Successful',
        token: loggedUser,
      });
    } else {
      response.status(HttpStatus.UNAUTHORIZED).send({
        status: false,
        message: 'Invalid login details',
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
    const verified = await this.authService.verifyAccount(request.body)
    if (!verified.status) {
      response.status(HttpStatus.OK).send({
        status: false,
        message: verified.message,
      });
    } else {
      response.status(HttpStatus.OK).send({
        status: true,
        message: 'Verification Successful',
      });
    }
  }

  @Get('verify/:email/:code')
  forgotPassword(@Param('email') email: string, @Param('code') code: string) {
    //return this.authService.findOne(+id);
    console.log("Email and Code: ", email + " - " + code)
  }

  @Patch(':id')
  resetPassword(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  verifyEmail(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
