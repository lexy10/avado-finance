import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import {UsersService} from "../users/users.service";

@Injectable()
export class WalletService {

  constructor(
      private userService: UsersService
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
