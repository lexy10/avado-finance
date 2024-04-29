import {Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {Request, Response} from "express";

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('get-deposit-address')
  async getDepositAddress(@Req() request: Request, @Res() response: Response) {
    const address = await this.transactionsService.getDepositAddress(request.body);
    if (address.status) {
      response.status(HttpStatus.OK).send({
        status: true,
        message: 'Deposit Address Fetched',
        address: address.wallet_address,
        //address_network: "USDT TRC20"
      });
    } else {
      response.status(HttpStatus.NOT_FOUND).send({
        status: true,
        message: 'Unable to fetch deposit address',
      });
    }
  }

  @Get('get-p2p')
  async getP2p(@Req() request: Request, @Res() response: Response) {
    const p2p = await this.transactionsService.getP2p()
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
