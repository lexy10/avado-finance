import {Injectable, NotFoundException} from '@nestjs/common';
import {UpdateTransactionDto} from './dto/update-transaction.dto';
import {UsersService} from "../users/users.service";
import qs from "qs";
import axios from "axios";
import * as crypto from 'crypto';
import {InjectRepository} from "@nestjs/typeorm";
import {TransactionEntity} from "./entities/transaction.entity";
import {Repository} from "typeorm";
import {SettingsService} from "../settings/settings.service";
import {Exception} from "handlebars";
import {CustomException} from "../exceptions/CustomException";
import {generateIdWithTime, generateTransactionHash} from "../utils";
import {UserEntity} from "../users/entities/user.entity";
import {CurrenciesService} from "../currencies/currencies.service";

@Injectable()
export class TransactionsService {
  constructor(
      private userService: UsersService,
      private settingsService: SettingsService,
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
      return { status: true, wallet_address: user[requestParams.coin+'_wallet_address'] }
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

  async getP2p() {

  }

  async findAll() {
    return await this.transactionRepository.find({ relations: ['user'] });
  }

  async findAllByCurrency(currency: string) {
    return await this.transactionRepository.find({ where: { currency: currency }, relations: ['user'] });
  }

  async verifyPayment(request: any) {
    const cp_merchant_id = 'bc3bd01e0692865f07db85a03f3fe47f'; // Fill in with your CoinPayments merchant ID
    const cp_ipn_secret = 'avadofinsec'; // Fill in with your CoinPayments IPN secret

    const ipnMode = request.body.ipn_mode;
    if (!ipnMode || ipnMode !== 'hmac') {
      //return errorAndDie('IPN Mode is not HMAC');
      console.log('IPN Mode is not HMAC');
      throw new CustomException('IPN Mode is not HMAC')
    }

    const hmac = request.headers['hmac'];
    if (!hmac) {
      //return errorAndDie('No HMAC signature sent.');
      console.log('No HMAC signature sent.');
      throw new CustomException('No HMAC signature sent.')
    }

    const requestBody = request.body
    //const clonedRequestBody = { ...requestBody }; // Shallow copy of request.body
    //delete clonedRequestBody.user;
    const requestPayload = qs.stringify(requestBody);
    const calculatedHmac = crypto.createHmac('sha512', cp_ipn_secret).update(requestPayload).digest('hex');
    if (hmac !== calculatedHmac) {
      //return errorAndDie('HMAC signature does not match');
      console.log('HMAC signature does not match');
      throw new CustomException('HMAC signature does not match' )
    }

    const userAccount = this.userService.findOneByEmail(requestBody.email_address)

    if (!userAccount)
      throw new CustomException("User with email address not found")

    // IPN Signature verified, process IPN data
    const postData = {
      user: userAccount,
      ipnType: requestBody.ipn_type,
      depositId: requestBody.deposit_id,
      txnId: requestBody.txn_id,
      address: requestBody.address,
      status: parseInt(requestBody.status),
      currency: requestBody.currency,
      confirms: requestBody.confirms,
      amount: parseFloat(requestBody.amount),
      amount_in_usd: parseFloat(requestBody.fiat_amount),
      fee: parseFloat(requestBody.fee),
      fee_in_usd: parseFloat(requestBody.fiat_fee)
    }

    // Example: Check if payment status indicates success
    if (postData.status >= 100 || postData.status === 2) {
      // Payment is complete or queued for nightly payout
      // Perform actions for successful payment
      // give bonus to user


      return await this.createOrUpdateTransaction(postData)
    } else if (postData.status < 0) {
      // Payment error
      // Handle payment error
      throw new CustomException('Payment Error')
    } else {
      // Payment is pending
      // Handle pending payment
      return await this.createOrUpdateTransaction(postData)
    }
  }

  async createOrUpdateTransaction(postData: any): Promise<TransactionEntity> {

    const user = postData.user
    // Check if transaction exists
    let transaction = await this.transactionRepository.findOneBy({ transaction_id: postData.txnId, deposit_id: postData.depositId } );

    if (!transaction) {
      // If transaction does not exist, create new transaction
      transaction = new TransactionEntity();
      transaction.user = user;
      transaction.amount = postData.amount
      transaction.amount_in_usd = postData.amount_in_usd
      transaction.type = postData.ipnType
      transaction.currency = postData.currency
      transaction.to_wallet_address = postData.address
      transaction.to_wallet_currency = postData.currency
      transaction.transaction_status = postData.status
      transaction.deposit_id = postData.depositId
      transaction.transaction_id = postData.txnId
      transaction.transaction_confirmations = postData.confirms
      transaction.transaction_fee = postData.fee
      transaction.transaction_fee_in_usd = postData.fee_in_usd
      transaction.post_data = qs.stringify(postData)

      // Set other fields with dummy data as needed
    } else {
      // If transaction exists, update status
      transaction.transaction_status = postData.status;
    }

    // Save transaction
    return this.transactionRepository.save(transaction);
  }

  async giveDepositBonus(user: UserEntity) {
    const referrer = user.referrer
    console.log(referrer)
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
