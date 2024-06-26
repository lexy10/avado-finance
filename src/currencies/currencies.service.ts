import { Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CurrencyEntity } from './entities/currency.entity';
import { CurrencyNetworkEntity } from './entities/currency_networks.entity';
import { raw } from 'express';

@Injectable()
export class CurrenciesService {
  private counter: number = 0;

  private currencyNetworkName = {
    usdt: {
      trc20: 'usdt.trc20',
      erc20: 'usdt.erc20',
      bep2: 'usdt.bep2',
      bep20: 'usdt.bep20',
      prc20: 'usdt.prc20',
      sol: 'usdt.sol',
    },
    usdc: {
      trc20: 'usdc.trc20',
      erc20: 'usdc',
      bep20: 'usdc.bep20',
      prc20: 'usdc.prc20',
      sol: 'usdc.sol',
    },
    btc: { btc: 'btc', bep20: 'btc.bep20', bep2: 'btc.bep2', ln: 'btc.ln' },
    eth: { eth: 'eth', bep20: 'eth.bep20', bep2: 'eth.bep2' },
    sol: { sol: 'sol' },
    matic: { poly: 'matic.poly' },
    bnb: { bnb: 'bnb', bep20: 'bnb.bsc', erc20: 'bnb.erc20' },
  };

  constructor(
    @InjectRepository(CurrencyEntity)
    private currenciesRepository: Repository<CurrencyEntity>,
    @InjectRepository(CurrencyNetworkEntity)
    private currencyNetworkRepository: Repository<CurrencyNetworkEntity>,
  ) {}

  async fetchCurrencyPriceRate() {
    const coins = await this.currenciesRepository.find({
      order: {
        id: 'ASC',
      },
    });

    // Extract the coin names from the result array
    const coinsNames = coins.map((coin) => ({
      name: coin.coin_name,
      rate: coin.coin_rate,
    }));

    return await this.convertCryptoBalancesToUSD(coinsNames);
  }

  formatBalanceKey(key: string): string {
    switch (key) {
      case 'usdt':
        return 'tether';
      case 'btc':
        return 'bitcoin';
      case 'usdc':
        return 'usd-coin';
      case 'eth':
        return 'ethereum';
      case 'sol':
        return 'solana';
      case 'bnb':
        return 'binancecoin';
      case 'matic':
        return 'matic-network';
      case 'ngn':
        return 'ngn';
    }
  }

  async convertCryptoBalancesToUSD(coinNames) {
    if (this.counter + 1 == coinNames.length) this.counter = 0;
    const currency = coinNames[this.counter].name;
    const rate = coinNames[this.counter].rate;
    try {
      axios
        .request({
          method: 'GET',
          //url: `https://api.coingecko.com/api/v3/simple/price?ids=${this.formatBalanceKey(currency)}&vs_currencies=usd`,
          url: `https://api.fastforex.io/fetch-one?from=${currency}&to=usd&api_key=demo`,
        })
        .then(async (response) => {
          // Calculate the equivalent amount in USD
          const currentPriceInUSD = response.data.result.USD;

          const curr = await this.currenciesRepository.findOneBy({
            coin_name: currency,
          });
          curr['coin_rate'] = currentPriceInUSD;
          curr['coin_old_rate'] = rate;
          await this.currenciesRepository.save(curr);
          ++this.counter;

          const a = {
            coin: currency,
            new_rate: currentPriceInUSD,
            old_rate: rate,
          };

          console.log(a);
          return currentPriceInUSD;
        })
        .catch((error) => {
          console.error(
            `Error fetching conversion data for ${currency}:`,
            error,
          );
          throw error;
        });
    } catch (error) {
      console.error('Error converting balances to USD:', error);
      throw error;
    }
  }

  async fetchCurrencies(): Promise<any[]> {
    const entities = await this.currenciesRepository.find({
      select: [
        'coin_name',
        'coin_rate',
        'coin_old_rate',
        'coin_fullname',
        'coin_networks',
      ],
      order: {
        id: 'ASC',
      },
    });

    // Define the desired order
    const order = ['ngn', 'usdt', 'btc', 'usdc', 'eth', 'bnb', 'sol', 'matic'];

    // Sort the currencies array based on the order array
    entities.sort((a, b) => order.indexOf(a.coin_name) - order.indexOf(b.coin_name));


    return await Promise.all(
      entities.map(async (entity) => ({
        coin_name: entity.coin_name,
        coin_rate: entity.coin_rate,
        coin_old_rate: entity.coin_old_rate,
        coin_fullname: entity.coin_fullname,
        coin_networks: await this.fetchCoinNetworks(entity.coin_networks),
      })),
    );
  }

  async fetchCoinNetworks(networksArray: string[]) {
    if (!networksArray) return [];

    const idArrays = networksArray.map((id) => parseInt(id, 10));

    let result: { id: number; name: string; iso: string }[];

    const currencyNetworks = await this.currencyNetworkRepository.find({
      where: {
        id: In(idArrays),
      },
      select: ['id', 'network_name', 'network_iso'],
      order: {
        id: 'ASC',
      },
    });

    return currencyNetworks.map((currencyNetwork) => ({
      name: currencyNetwork.network_name,
      iso: currencyNetwork.network_iso,
    }));
  }

  /*async fetchCurrenciesName(): Promise<any[]> {
    const entities = await this.currenciesRepository.find({
      select: ["coin_name", "coin_fullname"]
    });
    return entities.map(entity => ({
      coin_name: entity.coin_name,
      coin_fullname: entity.coin_fullname,
    }))
  }*/

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

  async createNetworks(networkArray) {
    const networks = this.currencyNetworkRepository.create(networkArray);
    return await this.currencyNetworkRepository.save(networks);
  }

}
