import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { UsersService } from '../users/users.service';
import { CustomException } from '../exceptions/CustomException';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import {
  formatBalance,
  generateIdWithTime,
  generateTransactionHash,
} from '../utils';
import { CurrenciesService } from '../currencies/currencies.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import qs from 'qs';
import axios from 'axios';
import crypto from 'crypto';
import { WalletEntity } from './entities/wallet.entity';
import * as net from 'net';

@Injectable()
export class WalletService {
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
    private userService: UsersService,
    private currenciesService: CurrenciesService,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
  ) {}

  async getDepositAddress(requestParams: any) {
    const user = await this.userService.findOneByEmail(
      requestParams.user.email_address,
    );

    const currency = requestParams.currency.toLocaleLowerCase();

    // check if requested wallet with same network exists
    const existingWallet = await this.walletRepository.findOneBy({
      user_id: user.id,
      wallet_currency: currency,
      wallet_network: requestParams.network,
    });
    if (!existingWallet) {
      if (!this.currencyNetworkName[currency])
        throw new CustomException('Currency is invalid');

      const depositISO =
        this.currencyNetworkName[currency][requestParams.network];

      if (!depositISO) throw new CustomException('Currency network is invalid');

      const walletAddressResult = await this.generateDepositAddress(
        depositISO,
        requestParams.user.email_address,
      );
      if (walletAddressResult.error != 'ok')
        throw new CustomException('Unable to fetch deposit address');

      const wallet = new WalletEntity();
      wallet.user_id = user.id;
      wallet.wallet_currency = requestParams.currency;
      wallet.wallet_network = requestParams.network;
      wallet.wallet_address = walletAddressResult.result.address;
      await this.walletRepository.save(wallet);
      return walletAddressResult.result.address;
    } else {
      return existingWallet.wallet_address;
    }
  }

  async generateDepositAddress(coin, user): Promise<any> {
    const url = 'https://www.coinpayments.net/api.php';
    const data = qs.stringify({
      currency: coin,
      version: '1',
      cmd: 'get_callback_address',
      key: '01ffb4dbd85a47aeb360bef363d568aa1ccc3a1bcd0a58fb71069f452ee705d5',
      email: user.email_address,
      format: 'json',
    });
    console.log(coin);
    const hmacString = this.createHmac(data);
    const config = {
      maxBodyLength: Infinity,
      headers: {
        HMAC: hmacString,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    try {
      const response = await axios.post(url, data, config);
      console.log(response.data);
      return response.data;
    } catch (error) {
      // Handle error
      console.error('Error:', error.response.data);
      throw error;
    }
  }

  createHmac(data: string): string {
    const hmac = crypto.createHmac(
      'sha512',
      '19E2e60291fCeC1F3DA0f23Ce03031c738f88e1502e88b7f4475Cb82Cc6a6859',
    );
    hmac.update(data);
    return hmac.digest('hex');
  }

  async findAll(requestParams) {
    const wallets = [
      'ngn',
      'usdt',
      'btc',
      'usdc',
      'eth',
      'bnb',
      'sol',
      'matic',
    ];
    const userAccount = await this.userService.findOneByEmail(
      requestParams.user.email_address,
    );

    // Initialize an empty object to store the result
    const result = {};

    // Iterate over the wallets array
    wallets.forEach((wallet) => {
      // Check if the wallet property exists in the findOneByResult
      if (
        userAccount.hasOwnProperty(`${wallet}_wallet_address`) ||
        userAccount.hasOwnProperty(`${wallet}_balance`)
      ) {
        // Construct the object for the current wallet
        result[wallet] = {
          [`address`]: userAccount[`${wallet}_wallet_address`],
          [`balance`]: userAccount[`${wallet}_balance`],
        };
      }
    });

    return { status: true, wallets: result };
  }

  async swapCoinSummary(request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );
    const swapFromCoin = request.swap_from;
    const swapToCoin = request.swap_to;
    const swapFromValue = request.swap_from_value;

    const coins = await this.currenciesService.fetchCurrencies();
    const fromCoinEntity = coins.find(
      (entity) => entity.coin_name === swapFromCoin,
    );
    const toCoinEntity = coins.find(
      (entity) => entity.coin_name === swapToCoin,
    );

    if (!swapFromCoin)
      throw new CustomException('No currency selected to swap from');

    if (!swapToCoin)
      throw new CustomException('No currency selected to swap to');

    if (!swapFromValue) throw new CustomException('No value to swap');

    if (!fromCoinEntity)
      throw new CustomException(swapFromCoin + ' not supported');

    if (!toCoinEntity)
      throw new CustomException(swapFromCoin + ' not supported');

    if (swapFromCoin == swapToCoin)
      throw new CustomException("You can't swap to same coin");

    if (user[swapFromCoin + '_balance'] < swapFromValue)
      throw new CustomException('Balance is lower than swap amount');

    // convert from amount to usd
    const swappedAmount =
      (parseFloat(fromCoinEntity.coin_rate) /
        parseFloat(toCoinEntity.coin_rate)) *
      parseFloat(swapFromValue);

    const fee = 0;

    return {
      amount: formatBalance(swappedAmount, swapFromCoin),
      fee: fee,
    };
  }

  async swapCoin(request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );
    const swapFromCoin = request.swap_from;
    const swapToCoin = request.swap_to;
    const swapNetwork = request.swap_network;
    const swapFromValue = request.swap_from_value;

    const coins = await this.currenciesService.fetchCurrencies();
    const fromCoinEntity = coins.find(
      (entity) => entity.coin_name === swapFromCoin,
    );
    const toCoinEntity = coins.find(
      (entity) => entity.coin_name === swapToCoin,
    );

    if (!swapFromCoin)
      throw new CustomException('No currency selected to swap from');

    if (!swapToCoin)
      throw new CustomException('No currency selected to swap to');

    if (!swapFromValue) throw new CustomException('No value to swap');

    if (!fromCoinEntity)
      throw new CustomException(swapFromCoin + ' not supported');

    if (!toCoinEntity)
      throw new CustomException(swapFromCoin + ' not supported');

    if (swapFromCoin == swapToCoin)
      throw new CustomException("You can't swap to same coin");

    if (user[swapFromCoin + '_balance'] < swapFromValue)
      throw new CustomException('Balance is lower than swap amount');

    const swapFromValueInUSD = swapFromValue * fromCoinEntity.coin_rate;

    // convert from to usd
    let swappedAmount =
      (parseFloat(fromCoinEntity.coin_rate) /
        parseFloat(toCoinEntity.coin_rate)) *
      parseFloat(swapFromValue);

    // set swap bonus
    if (
      !user.has_received_swap_bonus &&
      swapFromValueInUSD >= 15 &&
      swapToCoin == 'usdc'
    ) {
      swappedAmount += 10;
      user.has_received_swap_bonus = true;
    }

    // decrement balance
    user[swapFromCoin + '_balance'] -= swapFromValue;

    user[swapFromCoin + '_balance'] = formatBalance(
      user[swapFromCoin + '_balance'],
      swapFromCoin,
    );

    // increment balance
    user[swapToCoin + '_balance'] += swappedAmount;
    user[swapToCoin + '_balance'] = formatBalance(
      user[swapToCoin + '_balance'],
      swapToCoin,
    );

    const userValue = await this.userService.updateUser(user);

    // create transaction
    const swapTransaction = new TransactionEntity();
    swapTransaction.amount = formatBalance(swapFromValue, swapFromCoin);
    swapTransaction.amount_in_usd = formatBalance(swapFromValueInUSD, 'usd');
    swapTransaction.type = 'swap';
    swapTransaction.currency = swapFromCoin;
    swapTransaction.from_wallet_currency = swapFromCoin;
    swapTransaction.to_wallet_currency = swapToCoin;
    swapTransaction.transaction_network = swapNetwork;
    swapTransaction.transaction_status = 'success';
    swapTransaction.transaction_hash = generateTransactionHash();
    swapTransaction.transaction_id = generateIdWithTime();
    swapTransaction.transaction_fee = 0;
    swapTransaction.transaction_fee_in_usd = 0;
    swapTransaction.user = user;

    await this.transactionRepository.save(swapTransaction);

    return userValue.wallets();
  }

  async fetchCurrencies() {
    return await this.currenciesService.fetchCurrencies();
  }

  async withdraw(request) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );
    if (
      !request.type ||
      (request.type !== 'crypto_withdrawal' &&
        request.type !== 'fiat_withdrawal')
    )
      throw new CustomException('Withdrawal type is invalid');

    if (request.type == 'crypto_withdrawal') {
      if (!request.from_currency)
        throw new CustomException('Currency is invalid');

      if (!request.amount) throw new CustomException('Amount is invalid');

      if (!request.to_wallet_currency)
        throw new CustomException('Recipient wallet currency is invalid');

      if (!request.to_wallet_network)
        throw new CustomException('Recipient currency network is invalid');

      if (!request.to_wallet_address)
        throw new CustomException('Recipient wallet address is invalid');

      // check for balance if greater than amount
      const availableBalance = user[request.from_currency + '_balance'];

      if (parseFloat(request.amount) > parseFloat(availableBalance))
        throw new CustomException('Balance is lesser than requested amount');

      const coins = await this.currenciesService.fetchCurrencies();
      const fromCoinEntity = coins.find(
        (entity) => entity.coin_name === request.from_currency,
      );

      const withdrawAmountInUSD = request.amount * fromCoinEntity.coin_rate;

      //deduct from user balance
      user[request.from_currency + '_balance'] =
        parseFloat(availableBalance) - parseFloat(request.amount);

      user[request.from_currency + '_balance'] = formatBalance(
        user[request.from_currency + '_balance'],
        request.from_currency,
      );

      await this.userService.updateUser(user);

      // fetch first address
      const address = await this.getDepositAddress({
        currency: request.from_currency,
        network: request.to_wallet_network,
        user: user,
      });

      // create transaction
      const withdrawalTransaction = new TransactionEntity();

      withdrawalTransaction.amount = formatBalance(
        request.amount,
        request.from_currency,
      );
      withdrawalTransaction.amount_in_usd = formatBalance(
        withdrawAmountInUSD,
        'usd',
      );
      withdrawalTransaction.type = 'withdrawal';
      withdrawalTransaction.currency = request.from_currency;
      withdrawalTransaction.from_wallet_currency = request.from_currency;
      withdrawalTransaction.from_wallet_address = address;
      withdrawalTransaction.to_wallet_currency = request.to_wallet_currency;
      withdrawalTransaction.transaction_network = request.to_wallet_network;
      withdrawalTransaction.transaction_status = 'pending';
      withdrawalTransaction.transaction_hash = generateTransactionHash();
      withdrawalTransaction.transaction_id = generateIdWithTime();
      withdrawalTransaction.transaction_fee = 0;
      withdrawalTransaction.transaction_fee_in_usd = 0;
      withdrawalTransaction.transaction_confirmations = '0';
      withdrawalTransaction.user = user;

      return await this.transactionRepository.save(withdrawalTransaction);
    } else if (request.type == 'fiat_withdrawal') {
      if (!request.from_currency)
        throw new CustomException('Currency is invalid');

      if (!request.amount) throw new CustomException('Amount is invalid');

      if (parseFloat(request.amount) < 2000)
        throw new CustomException('Minimum withdrawal amount is NGN2,000');

      if (!user.bank_name || !user.account_name || !user.account_number)
        throw new CustomException('User has not added bank details');

      // check for balance if greater than amount
      const availableBalance = user[request.from_currency + '_balance'];

      if (parseFloat(request.amount) > parseFloat(availableBalance))
        throw new CustomException('Balance is lesser than requested amount');

      const coins = await this.currenciesService.fetchCurrencies();
      const fromCoinEntity = coins.find(
        (entity) => entity.coin_name === request.from_currency,
      );

      const withdrawAmountInUSD = request.amount * fromCoinEntity.coin_rate;

      //deduct from user balance
      user[request.from_currency + '_balance'] =
        parseFloat(availableBalance) - parseFloat(request.amount);

      user[request.from_currency + '_balance'] = formatBalance(
        user[request.from_currency + '_balance'],
        request.from_currency,
      );

      await this.userService.updateUser(user);

      // create transaction
      const withdrawalTransaction = new TransactionEntity();

      withdrawalTransaction.amount = parseFloat(request.amount);
      withdrawalTransaction.amount_in_usd = withdrawAmountInUSD;
      withdrawalTransaction.type = 'withdrawal';
      withdrawalTransaction.currency = request.from_currency;
      withdrawalTransaction.from_wallet_currency = request.from_currency;
      withdrawalTransaction.to_wallet_currency = 'Own Bank';
      withdrawalTransaction.transaction_status = 'pending';
      withdrawalTransaction.transaction_hash = generateTransactionHash();
      withdrawalTransaction.transaction_id = generateIdWithTime();
      withdrawalTransaction.transaction_fee = 0;
      withdrawalTransaction.transaction_fee_in_usd = 0;
      withdrawalTransaction.transaction_confirmations = '0';
      withdrawalTransaction.user = user;

      return await this.transactionRepository.save(withdrawalTransaction);
    }
  }

  async runWallet() {
    const networkArray = [
      { id: 100, network_name: 'Tron/TRC20', network_iso: 'trc20' },
      { id: 101, network_name: 'ERC20', network_iso: 'erc20' },
      { id: 102, network_name: 'Ether', network_iso: 'eth' },
      { id: 103, network_name: 'BSC Chain', network_iso: 'bep20' },
      { id: 104, network_name: 'Polygon Chain', network_iso: 'poly' },
      { id: 105, network_name: 'Polygon/MATIC', network_iso: 'prc20' },
      { id: 106, network_name: 'BC Chain', network_iso: 'bep2' },
      { id: 107, network_name: 'Solana', network_iso: 'sol' },
      { id: 108, network_name: 'BNB Coin', network_iso: 'bnb' },
      { id: 109, network_name: 'Bitcoin', network_iso: 'btc' },
      { id: 110, network_name: 'Lightning Network', network_iso: 'ln' },
    ];

    return await this.currenciesService.createNetworks(networkArray);
  }

  findOne(id: number) {
    return `This action returns a #${id} wallet`;
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}
