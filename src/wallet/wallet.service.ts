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

@Injectable()
export class WalletService {

  constructor(
      private userService: UsersService,
      private currenciesService: CurrenciesService,
      @InjectRepository(TransactionEntity) private transactionRepository: Repository<TransactionEntity>
  ) {}

  create(createWalletDto: CreateWalletDto) {
    return 'This action adds a new wallet';
  }

  async findAll(requestParams) {
    const wallets = ['ngn', 'usdt', 'usdc', 'btc', 'eth', 'bnb', 'solana', 'matic']
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
