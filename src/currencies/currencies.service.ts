import { Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import axios from "axios";
import {InjectRepository} from "@nestjs/typeorm";
import {SettingsEntity} from "../settings/entities/setting.entity";
import {Repository} from "typeorm";
import {CurrencyEntity} from "./entities/currency.entity";

@Injectable()
export class CurrenciesService {

  private counter: number = 0

  constructor(
      @InjectRepository(CurrencyEntity) private currenciesRepository: Repository<CurrencyEntity>,
  ) {
  }

  async fetchCurrencyPriceRate() {

    const coins = await this.currenciesRepository.find();

    // Extract the coin names from the result array
    const coinsNames = coins.map(coin => coin.coin_name);

    return await this.convertCryptoBalancesToUSD(coinsNames)
  }

  formatBalanceKey(key: string): string {
    switch (key) {
      case 'usdt':
        return 'tether'
      case 'btc':
        return 'bitcoin'
      case 'usdc':
        return 'usd-coin'
      case 'eth':
        return 'ethereum'
      case 'sol':
        return 'solana'
      case 'bnb':
        return 'binancecoin'
      case 'matic':
        return 'matic-network'
    }
  }

  async convertCryptoBalancesToUSD(balances) {
    if ((this.counter + 1) == balances.length) this.counter = 0
    const currency = balances[this.counter]
    try {

      axios.request({
        method: 'GET',
        url: `https://api.coingecko.com/api/v3/simple/price?ids=${this.formatBalanceKey(currency)}&vs_currencies=usd`,
      })
          .then(async (response) => {
            // Calculate the equivalent amount in USD
            const currentPriceInUSD = response.data[this.formatBalanceKey(currency)].usd;

            const curr = await this.currenciesRepository.findOneBy( { coin_name: currency })
            curr['coin_rate'] = currentPriceInUSD
            await this.currenciesRepository.save(curr)
            ++this.counter

            console.log(currentPriceInUSD)

            return currentPriceInUSD

          })
          .catch((error) => {
            console.error(`Error fetching conversion data for ${currency}:`, error);
            throw error;
          })
    } catch (error) {
      console.error('Error converting balances to USD:', error);
      throw error;
    }
  }

  async fetchCurrencies(): Promise<any[]> {
    const entities = await this.currenciesRepository.find({
      select: ["coin_name", "coin_rate"]
    });
    return entities.map(entity => ({
      coin_name: entity.coin_name,
      coin_rate: entity.coin_rate,
    }))
  }

  async fetchCurrenciesName(): Promise<any[]> {
    const entities = await this.currenciesRepository.find({
      select: ["coin_name", "coin_fullname"]
    });
    return entities.map(entity => ({
      coin_name: entity.coin_name,
      coin_fullname: entity.coin_fullname,
    }))
  }

  async seedCurrencies() {
    const coins = [
      { coin_name: 'usdt', coin_fullname: 'Tether(USDT)', coin_rate: 0 },
      { coin_name: 'btc', coin_fullname: 'Bitcoin', coin_rate: 0 },
      { coin_name: 'usdc', coin_fullname: 'USD Coin', coin_rate: 0 },
      { coin_name: 'bnb', coin_fullname: 'Binance Coin', coin_rate: 0 },
      { coin_name: 'eth', coin_fullname: 'Ethereum', coin_rate: 0 },
      { coin_name: 'sol', coin_fullname: 'Solana', coin_rate: 0 },
      { coin_name: 'matic', coin_fullname: 'Matic', coin_rate: 0 },
    ];
    /*for (const coin of coins) {
      const res = this.settingsRepository.create(coin);

    }*/

    return await this.currenciesRepository.save(coins);
  }

  create(createCurrencyDto: CreateCurrencyDto) {
    return 'This action adds a new currency';
  }

  findAll() {
    return `This action returns all currencies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} currency`;
  }

  update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    return `This action updates a #${id} currency`;
  }

  remove(id: number) {
    return `This action removes a #${id} currency`;
  }
}
