import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import {SettingsService} from "./settings/settings.service";
import {CurrenciesService} from "./currencies/currencies.service";

@Injectable()
export class PriceFetcherCron {

  constructor(private readonly currenciesService: CurrenciesService) {
  }

  @Cron(CronExpression.EVERY_30_MINUTES) // Specify the cron schedule as per your requirement
  async runCronJob() {
    try {
      //console.log('Coin Price Getter Cron Executed!');
      // Add your logic here
      await this.currenciesService.fetchCurrencyPriceRate()
    } catch (err) {
      console.log(err)
    }
  }
}