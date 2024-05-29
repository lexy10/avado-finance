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
  async findAllByCurrency(@Param('currency') currency: string, @Req() request: Request, @Res() response: Response,
  ) {
    try {
      const transactions =
        await this.transactionsService.findAllByCurrency(request.body, currency);
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
}



/*address: 'CE5xDxUYws9p79BCHB7w3UqyDEjtBzMYtkuyTTQi7TPg'
amount: '1.00000000'
amounti: '100000000'
confirms: '60'
currency: 'USDT.SOL'
deposit_id: 'CDIEXYYB0ZW28JMFY1L5CDWZLN'
fee: '0.00500000'
feei: '500000'
fiat_amount: '0.99911440'
fiat_amounti: '99911440'
fiat_coin: 'USD'
fiat_fee: '0.00499557'
fiat_feei: '499557'
ipn_id: 'c974250a0b6f8a5c7eabde53c8f6d62f'
ipn_mode: 'hmac'
ipn_type: 'deposit'
ipn_version: '1.0'
merchant: 'bc3bd01e0692865f07db85a03f3fe47f'
status: '100'
status_text : 'Deposit confirmed'
txn_id: '3zEzaf7wijBLq3SgbsNoVY9P7vtkr4SLYy1J9HwwpkdseP8HE6Jz5VB98cvu6X2FUsxwrEeMSsx9dwr41H4wpZz3'*/


/*address=CE5xDxUYws9p79BCHB7w3UqyDEjtBzMYtkuyTTQi7TPg&amount=1.00000000&amounti=100000000&confirms=60&currency=USDT.SOL&deposit_id=CDIEXYYB0ZW28JMFY1L5CDWZLN&fee=0.00500000&feei=500000&fiat_amount=0.99911440&fiat_amounti=99911440&fiat_coin=USD&fiat_fee=0.00499557&fiat_feei=499557&ipn_id=c974250a0b6f8a5c7eabde53c8f6d62f&ipn_mode=hmac&ipn_type=deposit&ipn_version=1.0&merchant=bc3bd01e0692865f07db85a03f3fe47f&status=100&status_text=Deposit+confirmed&txn_id=3zEzaf7wijBLq3SgbsNoVY9P7vtkr4SLYy1J9HwwpkdseP8HE6Jz5VB98cvu6X2FUsxwrEeMSsx9dwr41H4wpZz3*/

