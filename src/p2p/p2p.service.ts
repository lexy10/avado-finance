import {Injectable} from '@nestjs/common';
import {CreateP2pDto} from './dto/create-p2p.dto';
import {UpdateP2pDto} from './dto/update-p2p.dto';
import {CustomException} from "../exceptions/CustomException";
import {InjectRepository} from "@nestjs/typeorm";
import {P2pEntity} from "./entities/p2p.entity";
import {LessThan, Repository} from "typeorm";
import {TransactionEntity} from "../transactions/entities/transaction.entity";
import {generateIdWithTime, generateTransactionHash} from "../utils";
import {UsersService} from "../users/users.service";
import {TransactionsService} from "../transactions/transactions.service";

@Injectable()
export class P2pService {

  constructor(
      private userService: UsersService,
      private transactionService: TransactionsService,
      @InjectRepository(P2pEntity) private p2pRepository: Repository<P2pEntity>
  ) {
  }
  create(createP2pDto: CreateP2pDto) {
    return 'This action adds a new p2p';
  }

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
    ]

    for (const account of accounts) {
      let p2pAccount = new P2pEntity()
      p2pAccount.account_name = account.account_name
      p2pAccount.account_number = account.account_number
      p2pAccount.bank_name = account.bank_name

      await this.p2pRepository.save(p2pAccount)
    }

    return true

  }

  async getAccount(request) {
    if (!request.amount) {
      throw new CustomException("Please enter deposit amount in NGN")
    }

    const depositAmount = request.amount

    if (depositAmount < 2000)
      throw new CustomException("Minimum amount to deposit is NGN2,000")

    const accounts = await this.p2pRepository.findBy({ status: 'active', limit: LessThan(300) })
    const accountsAvailableForPay = accounts.filter(account => depositAmount <= (300000 - account.limit))

    if (accountsAvailableForPay.length <= 0)
      throw new CustomException("No account available at the moment, please try again later")

    const randomIndex = Math.floor(Math.random() * accountsAvailableForPay.length);
    return accountsAvailableForPay[randomIndex]
  }

  async makeP2pPayment(request) {
    if (!request.amount) {
      throw new CustomException("Please enter deposit amount in NGN")
    }

    if (!request.bank_name || !request.account_name || !request.account_number) {
      throw new CustomException("Bank details is not valid")
    }

    const user = await this.userService.findOneByEmail(request.user.email_address)

    const account = await this.p2pRepository.findOneBy({ account_name: request.account_name, account_number: request.account_number })

    const transaction = new TransactionEntity()
    transaction.amount = request.amount
    transaction.amount_in_usd = parseFloat(request.amount) * 1400
    transaction.type = 'p2p'
    transaction.currency = 'ngn'
    transaction.to_wallet_address = account.id
    transaction.to_wallet_currency = 'ngn'
    transaction.transaction_status = 'pending'
    transaction.transaction_hash = generateTransactionHash()
    transaction.transaction_id = generateIdWithTime()
    transaction.transaction_fee = 0
    transaction.transaction_fee_in_usd = 0
    transaction.user = user

    return this.transactionService.createTransaction(transaction)
  }

  findAll() {
    return `This action returns all p2p`;
  }

  findOne(id: number) {
    return `This action returns a #${id} p2p`;
  }

  update(id: number, updateP2pDto: UpdateP2pDto) {
    return `This action updates a #${id} p2p`;
  }

  remove(id: number) {
    return `This action removes a #${id} p2p`;
  }
}
