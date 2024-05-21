import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import {UsersService} from "../users/users.service";
import {CustomException} from "../exceptions/CustomException";
import {TransactionEntity} from "../transactions/entities/transaction.entity";
import {generateIdWithTime, generateTransactionHash} from "../utils";
import {CurrenciesService} from "../currencies/currencies.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import qs from "qs";
import axios from "axios";
import crypto from "crypto";

@Injectable()
export class WalletService {

  constructor(
      private userService: UsersService,
      private currenciesService: CurrenciesService,
      @InjectRepository(TransactionEntity) private transactionRepository: Repository<TransactionEntity>
  ) {}

  async getDepositAddress(requestParams: any) {
    const user = await this.userService.findOneByEmail(requestParams.user.email_address)
    if (!user[requestParams.coin+'_wallet_address']) {
      const walletAddressResult = await this.generateDepositAddress(requestParams.coin, requestParams.user.email_address)
      if (walletAddressResult.error != "ok")
        throw new CustomException("Unable to fetch deposit address")

      user[requestParams.coin+'_wallet_address'] = walletAddressResult.result.address
      await this.userService.updateUser(user)
      return walletAddressResult.result.address
    } else {
      return user[requestParams.coin+'_wallet_address']
    }
  }

  async generateDepositAddress(coin, user): Promise<any> {
    const url = 'https://www.coinpayments.net/api.php';
    const data = qs.stringify({
      'currency': coin,
      'version': '1',
      'cmd': 'get_callback_address',
      'key': '01ffb4dbd85a47aeb360bef363d568aa1ccc3a1bcd0a58fb71069f452ee705d5',
      'email': user.email_address,
      'format': 'json'
    });
    console.log(coin)
    const hmacString = this.createHmac(data)
    const config = {
      maxBodyLength: Infinity,
      headers: {
        'HMAC': hmacString,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    try {
      const response = await axios.post(url, data, config);
      console.log(response.data);
      return response.data
    } catch (error) {
      // Handle error
      console.error('Error:', error.response.data);
      throw error;
    }
  }

  createHmac(data: string): string {
    const hmac = crypto.createHmac('sha512', '19E2e60291fCeC1F3DA0f23Ce03031c738f88e1502e88b7f4475Cb82Cc6a6859');
    hmac.update(data);
    return hmac.digest('hex');
  }

  async findAll(requestParams) {
    const wallets = ['ngn', 'usdt', 'usdc', 'btc', 'eth', 'bnb', 'sol', 'matic']
    const userAccount = await this.userService.findOneByEmail(requestParams.user.email_address);

    // Initialize an empty object to store the result
    const result = {};

    // Iterate over the wallets array
    wallets.forEach((wallet) => {
      // Check if the wallet property exists in the findOneByResult
      if (userAccount.hasOwnProperty(`${wallet}_wallet_address`) || userAccount.hasOwnProperty(`${wallet}_balance`)) {
        // Construct the object for the current wallet
        result[wallet] = {
          [`address`]: userAccount[`${wallet}_wallet_address`],
          [`balance`]: userAccount[`${wallet}_balance`],
        };
      }
    });

    return { status: true, wallets: result }
  }

  async swapCoinSummary(request: any) {
    const user = await this.userService.findOneByEmail(request.user.email_address)
    const swapFromCoin = request.swap_from
    const swapToCoin = request.swap_to
    const swapFromValue = request.swap_from_value

    const coins = await this.currenciesService.fetchCurrencies()
    const fromCoinEntity = coins.find(entity => entity.coin_name === swapFromCoin);
    const toCoinEntity = coins.find(entity => entity.coin_name === swapToCoin);

    if (!swapFromCoin)
      throw new CustomException("No currency selected to swap from")

    if (!swapToCoin)
      throw new CustomException("No currency selected to swap to")

    if (!swapFromValue)
      throw new CustomException("No value to swap")

    if (!fromCoinEntity)
      throw new CustomException(swapFromCoin + " not supported")

    if (!toCoinEntity)
      throw new CustomException(swapFromCoin + " not supported")

    if (swapFromCoin == swapToCoin)
      throw new CustomException("You can't swap to same coin")

    if (user[swapFromCoin+'_balance'] < swapFromValue)
      throw new CustomException("Balance is lower than swap amount")

    // convert from amount to usd
    let swappedAmount = (parseFloat(fromCoinEntity.coin_rate) / parseFloat(toCoinEntity.coin_rate)) * parseFloat(swapFromValue)

    const fee = 0;

    return {
      amount: swappedAmount,
      fee: fee
    }
  }

  async swapCoin(request: any) {
    const user = await this.userService.findOneByEmail(request.user.email_address)
    const swapFromCoin = request.swap_from
    const swapToCoin = request.swap_to
    const swapNetwork = request.swap_network
    const swapFromValue = request.swap_from_value

    const coins = await this.currenciesService.fetchCurrencies()
    const fromCoinEntity = coins.find(entity => entity.coin_name === swapFromCoin);
    const toCoinEntity = coins.find(entity => entity.coin_name === swapToCoin);

    if (!swapFromCoin)
      throw new CustomException("No currency selected to swap from")

    if (!swapToCoin)
      throw new CustomException("No currency selected to swap to")

    if (!swapFromValue)
      throw new CustomException("No value to swap")

    if (!fromCoinEntity)
      throw new CustomException(swapFromCoin + " not supported")

    if (!toCoinEntity)
      throw new CustomException(swapFromCoin + " not supported")

    if (swapFromCoin == swapToCoin)
      throw new CustomException("You can't swap to same coin")

    if (user[swapFromCoin+'_balance'] < swapFromValue)
      throw new CustomException("Balance is lower than swap amount")

    const swapFromValueInUSD = swapFromValue * fromCoinEntity.coin_rate

    // convert from to usd
    let swappedAmount = (parseFloat(fromCoinEntity.coin_rate) / parseFloat(toCoinEntity.coin_rate)) * parseFloat(swapFromValue)

    // set swap bonus
    if (!user.has_received_swap_bonus && (swapFromValueInUSD >= 15) && swapToCoin == 'usdc' && swapNetwork == 'stellar') {
      swappedAmount += 10
      user.has_received_swap_bonus = true
    }

    // decrement balance
    user[swapFromCoin+'_balance'] -= swapFromValue

    // increment balance
    user[swapToCoin+'_balance'] += swappedAmount

    const userValue = await this.userService.updateUser(user)

    // create transaction
    const swapTransaction = new TransactionEntity()
    swapTransaction.amount = swapFromValue
    swapTransaction.amount_in_usd = swapFromValueInUSD
    swapTransaction.type = 'swap'
    swapTransaction.currency = swapFromCoin
    swapTransaction.from_wallet_currency = swapFromCoin
    swapTransaction.to_wallet_currency = swapToCoin
    swapTransaction.transaction_network = swapNetwork
    swapTransaction.transaction_status = 'success'
    swapTransaction.transaction_hash = generateTransactionHash()
    swapTransaction.transaction_id = generateIdWithTime()
    swapTransaction.transaction_fee = 0
    swapTransaction.transaction_fee_in_usd = 0
    swapTransaction.user = user

    await this.transactionRepository.save(swapTransaction)

    return userValue.wallets()

  }

  async fetchSwappableCurrencies() {
    return await this.currenciesService.fetchCurrenciesName()
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
