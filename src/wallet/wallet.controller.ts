import {Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, Res} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import {raw, Request, Response} from "express";

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.create(createWalletDto);
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
