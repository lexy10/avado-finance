import { Injectable } from '@nestjs/common';
import { CreateP2pDto } from './dto/create-p2p.dto';
import { UpdateP2pDto } from './dto/update-p2p.dto';
import { CustomException } from '../exceptions/CustomException';
import { InjectRepository } from '@nestjs/typeorm';
import { P2pEntity } from './entities/p2p.entity';
import { LessThan, Repository } from 'typeorm';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import {formatBalance, generateIdWithTime, generateTransactionHash} from '../utils';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import {CurrenciesService} from "../currencies/currencies.service";
import {UserEntity} from "../users/entities/user.entity";

@Injectable()
export class P2pService {
  constructor(
    private userService: UsersService,
    private transactionService: TransactionsService,
    private currenciesService: CurrenciesService,
    @InjectRepository(P2pEntity) private p2pRepository: Repository<P2pEntity>,
  ) {}

  async loadAccounts() {
    const accounts = [
      {
        account_name: 'Sulaiman Usman',
        account_number: '9160452168',
        bank_name: 'Momo Payment Service Bank',
      },
      {
        account_name: 'Mohammed Sanni',
        account_number: '9160486541',
        bank_name: 'Momo Payment Service Bank',
      },
      {
        account_name: 'Samira Adamu',
        account_number: '9069893225',
        bank_name: 'Momo Payment Service Bank',
      },
      {
        account_name: 'Yau Abubakar',
        account_number: '9036316070',
        bank_name: 'Momo Payment Service Bank',
      },
      {
        account_name: 'Oluwafemi Ogundare',
        account_number: '8161875171',
        bank_name: 'Momo Payment Service Bank',
      },
      {
        account_name: 'Joy James',
        account_number: '9032847939',
        bank_name: 'Momo Payment Service Bank',
      },
    ];

    for (const account of accounts) {
      const p2pAccount = new P2pEntity();
      p2pAccount.account_name = account.account_name;
      p2pAccount.account_number = account.account_number;
      p2pAccount.bank_name = account.bank_name;

      await this.p2pRepository.save(p2pAccount);
    }

    return true;
  }

  async getAccount(request) {
    if (!request.amount) {
      throw new CustomException('Please enter deposit amount in NGN');
    }

    const depositAmount = request.amount;

    if (depositAmount < 2000)
      throw new CustomException('Minimum amount to deposit is NGN2,000');

    const accounts = await this.p2pRepository.findBy({
      status: 'active',
      limit: LessThan(300),
    });
    const accountsAvailableForPay = accounts.filter(
      (account) => depositAmount <= 300000 - account.limit,
    );

    if (accountsAvailableForPay.length <= 0)
      throw new CustomException(
        'No account available at the moment, please try again later',
      );

    const randomIndex = Math.floor(
      Math.random() * accountsAvailableForPay.length,
    );
    return accountsAvailableForPay[randomIndex];
  }

  async getAllAccounts() {
    return await this.p2pRepository.find()
  }

  async findOneById(account_id) {
    return await this.p2pRepository.findOneBy({ id: account_id })
  }

  async makeP2pPayment(request) {
    if (!request.amount) {
      throw new CustomException('Please enter deposit amount in NGN');
    }

    if (!request.account_id) {
      throw new CustomException('Bank details is not valid');
    }

    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );

    const account = await this.p2pRepository.findOneBy({
      id: request.account_id,
    });

    if (!account) {
      throw new CustomException('Bank details is not valid');
    }

    const coins = await this.currenciesService.fetchCurrencies();
    const coinEntity = coins.find(
        (entity) => entity.coin_name === 'ngn',
    );

    const P2PValueInUSD = parseFloat(request.amount) * coinEntity.coin_rate;

    const transaction = new TransactionEntity();
    transaction.amount = request.amount;
    transaction.amount_in_usd = P2PValueInUSD;
    transaction.type = 'P2P Deposit';
    transaction.currency = 'ngn';
    transaction.to_wallet_address = account.id;
    transaction.to_wallet_currency = 'ngn';
    transaction.transaction_status = 'pending';
    transaction.transaction_hash = generateTransactionHash();
    transaction.transaction_id = generateIdWithTime();
    transaction.transaction_fee = 0;
    transaction.transaction_fee_in_usd = 0;
    transaction.user = user;

    return this.transactionService.createTransaction(transaction);
  }

  async updateAccount(account: P2pEntity) {
    return await this.p2pRepository.save(account);
  }
}
