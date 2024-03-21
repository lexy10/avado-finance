import {Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Req, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import {raw, Request, Response} from "express";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Req() request: Request, @Res() response: Response) {
    const registeredUser = await this.authService.register(request.body);
    if (registeredUser) {
      response.status(HttpStatus.CREATED).send({
        status: true,
        message: "Registration Successful",
        token: registeredUser,
      }, )
    } else {
      response.status(HttpStatus.CONFLICT).send({
        status: false,
        message: 'Account already exists',
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

  @Get()
  login2() {
    return this.authService.findAll();
  }

  @Get(':id')
  forgotPassword(@Param('id') id: string) {
    return this.authService.findOne(+id);
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
