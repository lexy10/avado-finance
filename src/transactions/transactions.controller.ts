import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Request, Response } from 'express';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('get-p2p')
  async getP2p(@Req() request: Request, @Res() response: Response) {
    const p2p = await this.transactionsService.getP2p();
  }

  @Get()
  async findAll(@Req() request: Request, @Res() response: Response) {
    try {
      const transactions = await this.transactionsService.findAll();
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Transactions fetched successfully',
        transactions,
      });
    } catch (error) {
      response.json({
        status: false,
        message: error.message,
      });
    }
  }

  @Get(':currency')
  async findAllByCurrency(
    @Param('currency') currency: string,
    @Res() response: Response,
  ) {
    try {
      const transactions =
        await this.transactionsService.findAllByCurrency(currency);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Transactions fetched successfully',
        transactions,
      });
    } catch (error) {
      response.json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('verify-payment')
  async verifyPayment(@Req() request: Request, @Res() response: Response) {
    try {
      const verified = await this.transactionsService.verifyPayment(request);
      return response.status(HttpStatus.OK).send('IPN OK');
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('fetch-p2p-account')
  async fetchP2pAccount(@Req() request: Request, @Res() response: Response) {
    try {
      //const account =
    } catch (e) {}
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
