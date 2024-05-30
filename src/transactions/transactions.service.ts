import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UsersService } from '../users/users.service';
import qs from 'qs';
import axios from 'axios';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { SettingsService } from '../settings/settings.service';
import { Exception } from 'handlebars';
import { CustomException } from '../exceptions/CustomException';
import { generateIdWithTime, generateTransactionHash } from '../utils';
import { UserEntity } from '../users/entities/user.entity';
import { CurrenciesService } from '../currencies/currencies.service';
import {WalletService} from "../wallet/wallet.service";
import {EmailService} from "../email/email.service";

@Injectable()
export class TransactionsService {

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
    private walletService: WalletService,
    private emailService: EmailService,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  async findAll() {
    return await this.transactionRepository.find({
      relations: ['user'],
      order: {
        id: 'DESC',
      },
    });
  }

  async allP2PTransactions() {
    return await this.transactionRepository.find({
      where: { type: 'P2P Deposit', currency: 'ngn' },
      //relations: ['user'],
      order: {
        id: 'DESC',
      },
    });
  }

  async findOneById(transaction_id) {
    return await this.transactionRepository.findOneBy({ id: transaction_id })
  }

  findRootKeyByNetworkName(networkName) {
    networkName = networkName.toLocaleLowerCase()
    for (const rootKey in this.walletService.currencyNetworkName) {
      const networks = this.walletService.currencyNetworkName[rootKey];
      for (const key in networks) {
        if (networks[key] === networkName) {
          return rootKey;
        }
      }
    }
    return null; // Return null if the network name is not found
  }

  async findAllByCurrency(request: any, currency: string) {
    const user = await this.userService.findOneByEmail(request.user.email_address)
    return await this.transactionRepository.find({
      where: { user: user.id, currency: currency },
      relations: ['user'],
    });
  }

  async verifyPayment(request: any) {
    const cp_merchant_id = 'bc3bd01e0692865f07db85a03f3fe47f'; // Fill in with your CoinPayments merchant ID
    const cp_ipn_secret = 'avadofinsec'; // Fill in with your CoinPayments IPN secret

    const ipnMode = (request.body.ipn_mode || '').trim().toLowerCase();
    if (!ipnMode || ipnMode != 'hmac') {
      //return errorAndDie('IPN Mode is not HMAC');
      console.log('IPN Mode is not HMAC');
      throw new CustomException('IPN Mode is not HMAC');
    }

    const hmac = request.headers['hmac'];
    if (!hmac) {
      //return errorAndDie('No HMAC signature sent.');
      console.log('No HMAC signature sent.');
      throw new CustomException('No HMAC signature sent.');
    }

    const merchant = (request.body.merchant || '').trim();
    if (!merchant || merchant != cp_merchant_id) {
      //return errorAndDie('IPN Mode is not HMAC');
      throw new CustomException('Merchant Invalid');
    }

    const requestBody = request.body;
    //const clonedRequestBody = { ...requestBody }; // Shallow copy of request.body
    //delete clonedRequestBody.user;
    let requestPayload = qs.stringify(requestBody, {
      encode: true,
      format: 'RFC1738', // This format preserves '+' characters
    });
    const calculatedHmac = crypto
      .createHmac('sha512', cp_ipn_secret)
      .update(requestPayload)
      .digest('hex');
    if (hmac !== calculatedHmac) {
      //return errorAndDie('HMAC signature does not match');
      console.log('HMAC signature does not match');
      throw new CustomException('HMAC signature does not match');
    }

    const userAccount = await this.walletService.findUserByAddress(
      requestBody.address,
    );

    //console.log(userAccount)

    if (!userAccount)
      throw new NotFoundException('User with address not found');


    // IPN Signature verified, process IPN data
    const postData = {
      user: userAccount,
      ipnType: requestBody.ipn_type,
      depositId: requestBody.deposit_id,
      txnId: requestBody.txn_id,
      address: requestBody.address,
      status: parseInt(requestBody.status),
      currency: this.findRootKeyByNetworkName(requestBody.currency),
      confirms: requestBody.confirms,
      amount: parseFloat(requestBody.amount),
      amount_in_usd: parseFloat(requestBody.fiat_amount),
      fullData: requestBody
    };

    // Example: Check if payment status indicates success
    if (postData.status >= 100 || postData.status === 2) {
      // Payment is complete or queued for nightly payout
      // Perform actions for successful payment
      // give bonus to user
      return await this.createOrUpdateTransaction(postData);
    } else if (postData.status < 0) {
      // Payment error
      // Handle payment error
      throw new CustomException('Payment Error');
    } else {
      // Payment is pending
      // Handle pending payment
      return await this.createOrUpdateTransaction(postData);
    }
  }

  async createOrUpdateTransaction(postData: any): Promise<TransactionEntity> {
    const user = postData.user;
    // Check if transaction exists
    let transaction = await this.transactionRepository.findOneBy({
      transaction_id: postData.txnId,
      deposit_id: postData.depositId,
    });

    if (!transaction) {
      // If transaction does not exist, create new transaction
      transaction = new TransactionEntity();
      transaction.user = user;
      transaction.amount = postData.amount;
      transaction.amount_in_usd = postData.amount_in_usd;
      transaction.type = 'Crypto Deposit';
      transaction.currency = postData.currency;
      transaction.to_wallet_address = postData.address;
      transaction.to_wallet_currency = postData.currency;
      transaction.transaction_status = postData.status == '100' || postData.status == '2' ? 'success' : 'pending';
      transaction.deposit_id = postData.depositId;
      transaction.transaction_id = postData.txnId;
      transaction.transaction_confirmations = postData.confirms;
      transaction.transaction_fee = postData.fee;
      transaction.transaction_fee_in_usd = postData.fee_in_usd;
      transaction.post_data = qs.stringify(postData.fullData);

      // increment user balance
      if (postData.status == '100' || postData.status == '2') {
        user[postData.currency + '_balance'] += postData.amount
        await this.userService.updateUser(user)
        await this.emailService.sendDepositConfirmation(user, postData.amount, postData.currency, postData.address);
      }

      // Set other fields with dummy data as needed
    } else {
      // increment user balance
      if (transaction.transaction_status == 'pending' && (postData.status == '100' || postData.status == '2')) {
        user[postData.currency + '_balance'] += postData.amount
        await this.userService.updateUser(user)
        await this.emailService.sendDepositConfirmation(user, postData.amount, postData.currency, postData.address);
      }

      // If transaction exists, update status
      transaction.transaction_status = postData.status == '100' || postData.status == '2' ? 'success' : 'pending';
    }

    // Save transaction
    return this.createTransaction(transaction);
  }

  async createTransaction(transaction: TransactionEntity) {
    return await this.transactionRepository.save(transaction);
  }

  async giveDepositBonus(user: UserEntity) {
    const referrer = user.referrer;
    console.log(referrer);
  }
}
