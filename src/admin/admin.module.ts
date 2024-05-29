import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import {UsersService} from "../users/users.service";
import {TransactionsService} from "../transactions/transactions.service";
import {P2pService} from "../p2p/p2p.service";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";
import {WalletService} from "../wallet/wallet.service";
import {TransactionEntity} from "../transactions/entities/transaction.entity";
import {CurrenciesService} from "../currencies/currencies.service";
import {P2pEntity} from "../p2p/entities/p2p.entity";
import {WalletEntity} from "../wallet/entities/wallet.entity";
import {CurrencyEntity} from "../currencies/entities/currency.entity";
import {CurrencyNetworkEntity} from "../currencies/entities/currency_networks.entity";
import {EmailService} from "../email/email.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
        UserEntity,
        TransactionEntity,
        P2pEntity,
        WalletEntity,
        CurrencyEntity,
        CurrencyNetworkEntity
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, UsersService, TransactionsService, P2pService, WalletService, CurrenciesService, EmailService],
})
export class AdminModule {}
