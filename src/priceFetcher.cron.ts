import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import {SettingsService} from "./settings/settings.service";

@Injectable()
export class PriceFetcherCron {

  constructor(private readonly settingsService: SettingsService) {
  }

  @Cron(CronExpression.EVERY_MINUTE) // Specify the cron schedule as per your requirement
  async runCronJob() {
    try {
      //console.log('Coin Price Getter Cron Executed!');
      // Add your logic here
      await this.settingsService.fetchCoinPriceRate()
    } catch (err) {
      console.log(err)
    }
  }
}