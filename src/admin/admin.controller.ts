import {Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import {Request, Response} from "express";

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  async getAllUsers(@Req() request: Request, @Res() response: Response) {
    try {
      const users = await this.adminService.getAllUsers();
      response.status(HttpStatus.OK).send({
        status: true,
        message: 'Users Fetched',
        users: users,
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).send({
        status: true,
        message: e.message,
      });
    }
  }

  @Get("p2p-payments")
  async getAllP2PPayments(@Req() request: Request, @Res() response: Response) {
    try {
      const P2PPayments = await this.adminService.getAllP2PPayments();
      response.status(HttpStatus.OK).send({
        status: true,
        message: 'Payments Fetched',
        data: P2PPayments,
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).send({
        status: true,
        message: e.message,
      });
    }
  }

  @Get("deposit-accounts")
  async getAllDepositAccounts(@Req() request: Request, @Res() response: Response) {
    try {
      const depositAccounts = await this.adminService.getAllDepositAccounts();
      response.status(HttpStatus.OK).send({
        status: true,
        message: 'Accounts Fetched',
        accounts: depositAccounts,
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).send({
        status: true,
        message: e.message,
      });
    }
  }

  @Post('users/verify')
  async verifyUser(@Req() request: Request, @Res() response: Response) {
    try {
      const verified = await this.adminService.verifyUser(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Verification Successful',
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('p2p-payment/verify')
  async verifyP2PPayment(@Req() request: Request, @Res() response: Response) {
    try {
      const verified = await this.adminService.verifyP2PPayment(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Verification Successful',
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('deposit-accounts/reset')
  async resetDepositAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const reset = await this.adminService.resetDepositAccount(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Account Reset Successful',
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }
}
