import {Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, Res} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import {raw, Request, Response} from "express";
import {TransactionsService} from "../transactions/transactions.service";

@Controller('wallets')
export class WalletController {
  constructor(
      private readonly walletService: WalletService,
  ) {}

  @Post('get-deposit-address')
  async getDepositAddress(@Req() request: Request, @Res() response: Response) {
    try {
      const address = await this.walletService.getDepositAddress(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Deposit Address Fetched',
        wallet_address: address,
      });
    } catch (error) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: error.me,
      });
    }
  }

  @Get('get-swappable-currencies')
  async fetchSwappableCurrencies(@Req() request: Request, @Res() response: Response) {
    try {
      const currencies = await this.walletService.fetchSwappableCurrencies()
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Currencies Fetched',
        currencies: currencies
      })
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message
      })
    }
  }

  @Post('swap-coin')
  async swapCoin(@Req() request: Request, @Res() response: Response) {
    try {
      const swap = await this.walletService.swapCoin(request.body)
      response.status(HttpStatus.OK).json({
        status: true,
        message: "Swap Successful",
        wallet: swap
      })
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      })
    }
  }

  @Post('get-swap-summary')
  async swapCoinSummary(@Req() request: Request, @Res() response: Response) {
    try {
      const swapSummary = await this.walletService.swapCoinSummary(request.body)
      response.status(HttpStatus.OK).json({
        status: true,
        message: "Swap Summary",
        wallet: swapSummary
      })
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      })
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletService.findOne(+id);
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
