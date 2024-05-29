import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import {UsersService} from "../users/users.service";
import {TransactionsService} from "../transactions/transactions.service";
import {P2pService} from "../p2p/p2p.service";
import {CustomException} from "../exceptions/CustomException";
import {EmailService} from "../email/email.service";
import {formatBalance} from "../utils";

@Injectable()
export class AdminService {

  constructor(
      private userService: UsersService,
      private emailService: EmailService,
      private transactionService: TransactionsService,
      private P2PService: P2pService,
  ) {
  }

  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  async getAllUsers() {
    return await this.userService.allUsers()
  }

  async getAllP2PPayments() {
    return await this.transactionService.allP2PTransactions()
  }

  async getAllDepositAccounts() {
    return await this.P2PService.getAllAccounts()
  }

  async verifyUser(requestBody) {
    const user = await this.userService.findOneByEmail(requestBody.user_email)

    if (!user)
      throw new CustomException('User not found')

    const verificationStatuses = ['unverified', 'pending', 'verified', 'failed']

    if (!requestBody.status || !verificationStatuses.includes(requestBody.status))
      throw new CustomException('Invalid verification Status')

    user.verification_status = requestBody.status

    return await this.userService.updateUser(user)
  }

  async verifyP2PPayment(requestBody) {
    if (!requestBody.transaction_id)
      throw new CustomException('Invalid Payment')

      const transaction = await this.transactionService.findOneById(requestBody.transaction_id)
    if (!transaction)
      throw new CustomException('Payment not found')

    // get the user with the payment
    const user = await this.userService.findOneById(transaction.user)

    if (!user)
      throw new CustomException('No User attached to this payment')

    const verificationStatuses = ['pending', 'success', 'failed']

    if (!requestBody.status || !verificationStatuses.includes(requestBody.status))
      throw new CustomException('Invalid verification Status')

    const amount = transaction.amount
    user[transaction.currency + '_balance'] += amount

    transaction.transaction_status = requestBody.status

    await this.userService.updateUser(user)

    await this.emailService.sendP2PDepositConfirmation(user, formatBalance(amount, transaction.currency))

    return await this.transactionService.createTransaction(transaction)
  }

  async resetDepositAccount(requestBody) {
    if (!requestBody.account_id)
      throw new CustomException('Invalid Account')

    const account = await this.P2PService.findOneById(requestBody.account_id)
    if (!account)
      throw new CustomException('Account not found')

    account.limit = 0

    return await this.P2PService.updateAccount(account)
  }
}
