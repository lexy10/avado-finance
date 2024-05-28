import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { Request, Response } from 'express';
import { P2pService } from '../p2p/p2p.service';
import { CustomException } from '../exceptions/CustomException';

@Controller('wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly p2pService: P2pService,
  ) {}

  @Post('get-deposit-address')
  async getDepositAddress(@Req() request: Request, @Res() response: Response) {
    try {
      if (!request.body.currency) {
        throw new CustomException('Please select a currency');
      }

      if (!request.body.network)
        throw new CustomException('Please select currency network');

      const address = await this.walletService.getDepositAddress(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Deposit Address Fetched',
        wallet_address: address,
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Get('get-swappable-currencies')
  async fetchCurrencies(@Req() request: Request, @Res() response: Response) {
    try {
      const currencies = await this.walletService.fetchCurrencies();
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Currencies Fetched',
        currencies: currencies,
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('swap-coin')
  async swapCoin(@Req() request: Request, @Res() response: Response) {
    try {
      const swap = await this.walletService.swapCoin(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Swap Successful',
        wallet: swap,
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('get-swap-summary')
  async swapCoinSummary(@Req() request: Request, @Res() response: Response) {
    try {
      const swapSummary = await this.walletService.swapCoinSummary(
        request.body,
      );
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Swap Summary',
        wallet: swapSummary,
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('get-p2p-account')
  async getP2pAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const p2pAccount = await this.p2pService.getAccount(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Account fetched',
        account: p2pAccount,
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('payment-made')
  async paymentMade(@Req() request: Request, @Res() response: Response) {
    try {
      const p2pAccount = await this.p2pService.makeP2pPayment(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Payment Pending',
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('withdraw')
  async withdraw(@Req() request: Request, @Res() response: Response) {
    try {
      const withdraw = await this.walletService.withdraw(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Withdrawal Pending',
        data: withdraw,
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Post('swap-bonus')
  async swapBonus(@Req() request: Request, @Res() response: Response) {
    try {
      const swapBonus = await this.walletService.swapBonus(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Swap Successful',
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Get()
  async findAll(@Req() request: Request, @Res() response: Response) {
    const wallets = await this.walletService.findAll(request.body);
    if (wallets.status) {
      response.status(HttpStatus.OK).send({
        status: true,
        message: 'Wallets Fetched',
        wallets: wallets.wallets,
        //address_network: "USDT TRC20"
      });
    } else {
      response.status(HttpStatus.NOT_FOUND).send({
        status: true,
        message: 'Unable to fetch deposit address',
      });
    }
  }

  @Get('run-wallet')
  async findOne() {
    return await this.walletService.runWallet();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletService.update(+id, updateWalletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.walletService.remove(+id);
  }
}
