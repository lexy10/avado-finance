import {Injectable} from '@nestjs/common';
import {CreateSettingDto} from './dto/create-setting.dto';
import {UpdateSettingDto} from './dto/update-setting.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {SettingsEntity} from "./entities/setting.entity";
import {Repository} from "typeorm";
import axios from "axios";

@Injectable()
export class SettingsService {

  private counter: number = 0

  constructor(
      @InjectRepository(SettingsEntity) private settingsRepository: Repository<SettingsEntity>,
  ) {
  }

  async fetchCoinPriceRate() {
    /*const currency = {
      usdt: 'tether',
      btc: 'bitcoin',
      matic: 'matic-network',
      usdc: '',
      eth: 'bridged-binance-peg-ethereum-opbnb',
      solana: '',
    }
      axios.request({
        method: 'GET',
        url: `https://api.coingecko.com/api/v3/simple/price?ids=${currency.usdt}&vs_currencies=usd`,
        headers: {accept: 'application/json', 'x-cg-pro-api-key': 'CG-R5HHZLb2p4RPRubRHBvFNrFz'}
      })
          .then((response) => {
            // Calculate the equivalent amount in USD
            console.log(response.data)
          })
          .catch((error) => {
            console.error(`Error fetching conversion data for ${currency}:`, error);
            throw error;
          })*/

    const coins = await this.settingsRepository.find();

    // Extract the coin names from the result array
    const coinsNames = coins.map(coin => coin.coin_name);

    await this.convertCryptoBalancesToUSD(coinsNames)
    return `This action returns all dashboard`;
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
      case 'solana':
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

      // Define an array to store all the promises for fetching conversion rates
      //const promises = [];

      //const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 60000 });

      axios.request({
        method: 'GET',
        url: `https://api.coingecko.com/api/v3/simple/price?ids=${this.formatBalanceKey(currency)}&vs_currencies=usd`,
        //headers: {accept: 'application/json', 'x-cg-pro-api-key': 'CG-R5HHZLb2p4RPRubRHBvFNrFz'}
      })
          .then(async (response) => {
            // Calculate the equivalent amount in USD
            //console.log(response.data)
            const currentPriceInUSD = response.data[this.formatBalanceKey(currency)].usd;
            //console.log(response.data[this.formatBalanceKey(currency)].usd)
            // Store the result in the results object
            //results[currency] = currentPriceInUSD * balances[currency];

            const curr = await this.settingsRepository.findOneBy( { coin_name: currency })
            curr['coin_rate'] = currentPriceInUSD
            await this.settingsRepository.save(curr)
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

  async fetchCoins(): Promise<any[]> {
    const entities = await this.settingsRepository.find({
      select: ["coin_name", "coin_rate"]
    });
    return entities.map(entity => ({
      coin_name: entity.coin_name,
      coin_rate: entity.coin_rate,
    }))
  }

  async seed() {
    const coins = [
      { coin_name: 'usdt', coin_fullname: 'Tether(USDT)', coin_rate: 0 },
      { coin_name: 'btc', coin_fullname: 'Bitcoin', coin_rate: 0 },
      { coin_name: 'usdc', coin_fullname: 'USD Coin', coin_rate: 0 },
      { coin_name: 'bnb', coin_fullname: 'Binance Coin', coin_rate: 0 },
      { coin_name: 'eth', coin_fullname: 'Ethereum', coin_rate: 0 },
      { coin_name: 'solana', coin_fullname: 'Solana', coin_rate: 0 },
      { coin_name: 'matic', coin_fullname: 'Matic', coin_rate: 0 },
    ];
    /*for (const coin of coins) {
      const res = this.settingsRepository.create(coin);

    }*/

    return await this.settingsRepository.save(coins);
  }

  create(createSettingDto: CreateSettingDto) {
    return 'This action adds a new setting';
  }

  findAll() {
    return `This action returns all settings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return `This action updates a #${id} setting`;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
