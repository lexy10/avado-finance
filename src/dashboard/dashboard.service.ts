import { Injectable } from '@nestjs/common';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsEntity } from '../settings/entities/setting.entity';
import { SettingsService } from '../settings/settings.service';
import { Exception } from 'handlebars';
import { CurrenciesService } from '../currencies/currencies.service';
import { formatBalance, formatChange } from '../utils';

@Injectable()
export class DashboardService {
  constructor(
    private userService: UsersService,
    private settingsService: SettingsService,
    private currenciesService: CurrenciesService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,
  ) {}

  create() {
    return 'This action adds a new dashboard';
  }

  async formatBalance(user: UserEntity) {
    let overallBalance: number = 0;
    const coins = await this.currenciesService.fetchCurrencies();

    coins.forEach((entity) => {
      overallBalance += user[entity.coin_name + '_balance'] * entity.coin_rate; // Accumulate coin_rate
    });

    //overallBalance += user.usd_balance
    //overallBalance += (user.ngn_balance / 1400)

    return formatBalance(overallBalance, 'usd');
  }

  async home(request: any): Promise<any> {
    const userId = request.user.id;
    const limit = 6;
    let transactions = [];
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['transactions'],
    });
    if (user && user.transactions) {
      user.transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Assuming 'createdAt' is a Date field
    }
    const balance = await this.formatBalance(user);
    if (!user) throw new Exception('Invalid user found');

    transactions = user.transactions.slice(0, limit);

    const currenciesArray = ['btc', 'usdt', 'ngn'];
    const currencies = await this.currenciesService.fetchCurrencies();

    const wallet = {};

    // Filter out the coins where coin_name is 'ngn'
    const filteredCurrencies = currencies.filter(
      (currency) =>
        currency.coin_name === 'btc' ||
        currency.coin_name === 'usdt' ||
        currency.coin_name === 'ngn',
    );

    const filteredtransactions = transactions.map(transaction => ({
      id: transaction.id,
      amount: formatBalance(transaction.amount, transaction.currency),
      amount_in_usd: formatBalance(transaction.amount_in_usd, 'usd'),
      currency: transaction.currency,
      type: transaction.type,
      status: transaction.status,
      transaction_status: transaction.transaction_status,
      createdAt: transaction.createdAt
    }));

    filteredCurrencies.forEach((currency) => {
      wallet[currency.coin_name] = {
        amount: formatBalance(
          user[currency.coin_name + '_balance'],
          currency.coin_name,
        ),
        amount_in_usd: formatBalance(
          user[currency.coin_name + '_balance'] * currency.coin_rate,
          'usd',
        ),
        rate: (currency.coin_name == 'ngn' ? formatBalance((1/currency.coin_rate), currency.coin_name) : formatBalance(currency.coin_rate, currency.coin_name)),
        ...formatChange(currency.coin_rate, currency.coin_old_rate),
      };
    });

    return {
      balance: balance,
      wallet: wallet,
      transactions: filteredtransactions,
    };
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
        return 'sol';
      case 'bnb':
        return 'binancecoin';
      case 'matic':
        return 'matic-network';
    }
  }

  async convertCryptoBalancesToUSD(balances, userAccount) {
    try {
      // Define an object to store the results
      const results = {};

      // Define an array to store all the promises for fetching conversion rates
      const promises = [];

      const http = rateLimit(axios.create(), {
        maxRequests: 1,
        perMilliseconds: 60000,
      });

      // Loop through each cryptocurrency in the balances array
      for (const currency of Object.keys(balances)) {
        if (currency == 'ngn' || currency == 'usd') continue;
        // Push a promise for fetching the conversion rate to the promises array

        promises.push(
          http
            .request({
              method: 'GET',
              url: `https://api.coingecko.com/api/v3/simple/price?ids=${this.formatBalanceKey(currency)}&vs_currencies=usd`,
              //headers: {accept: 'application/json', 'x-cg-pro-api-key': 'CG-R5HHZLb2p4RPRubRHBvFNrFz'}
            })
            .then(async (response) => {
              // Calculate the equivalent amount in USD
              const currentPriceInUSD =
                response.data[this.formatBalanceKey(currency)].usd;
              //console.log(response.data[this.formatBalanceKey(currency)].usd)
              // Store the result in the results object
              //results[currency] = currentPriceInUSD * balances[currency];

              if (!userAccount[currency + '_rate']) {
                userAccount[currency + '_rate'] = currentPriceInUSD;
                await this.userService.updateUser(userAccount);
              }
            })
            .catch((error) => {
              console.error(
                `Error fetching conversion data for ${currency}:`,
                error,
              );
              throw error;
            }),
        );
      }

      // Wait for all promises to resolve
      //await Promise.all(promises);

      // Wait for all promises to resolve
      await Promise.allSettled(promises)
        .then(() => {
          console.log('All requests completed');
        })
        .catch((error) => {
          console.error('Error in one or more requests:', error);
        });

      // Return the results object
      return results;
    } catch (error) {
      console.error('Error converting balances to USD:', error);
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }
}
