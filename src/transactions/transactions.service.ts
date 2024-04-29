import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {UsersService} from "../users/users.service";
import qs from "qs";
import axios from "axios";
import * as crypto from 'crypto';

@Injectable()
export class TransactionsService {
  constructor(
      private userService: UsersService
  ) {
  }

  async getDepositAddress(requestParams: any) {
    const user = await this.userService.findOne(requestParams.email_address)
    if (!user[requestParams.coin+'_wallet_address']) {
      const walletAddressResult = await this.generateDepositAddress(requestParams.coin)
      if (walletAddressResult.error == "ok"){
        user[requestParams.coin+'_wallet_address'] = walletAddressResult.result.address
        await this.userService.updateWalletAddress(user)
        return { status: true, wallet_address: walletAddressResult.result.address }
      } else { return { status: false } }
    } else {
      return { status: true, wallet_address: user[requestParams.coin+'_wallet_address'] }
    }
  }

  async generateDepositAddress(coin): Promise<any> {
    const url = 'https://www.coinpayments.net/api.php';
    const data = qs.stringify({
      'currency': coin,
      'version': '1',
      'cmd': 'get_callback_address',
      'key': '01ffb4dbd85a47aeb360bef363d568aa1ccc3a1bcd0a58fb71069f452ee705d5',
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

  findAll() {
    return `This action returns all transactions`;
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
