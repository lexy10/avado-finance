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
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Request, Response } from 'express';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async findAll(@Req() request: Request, @Res() response: Response) {
    //return this.settingsService.findAll();
    /*await this.currenciesService.seedCurrencies();
    response.status(HttpStatus.OK).send({
      status: true,
      message: 'Seeded',
    });*/
  }

}
