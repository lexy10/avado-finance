import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import {UsersService} from "../users/users.service";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";
import {TransactionsService} from "../transactions/transactions.service";
import {SettingsService} from "../settings/settings.service";
import {CurrenciesService} from "../currencies/currencies.service";
import {TransactionEntity} from "../transactions/entities/transaction.entity";
import {SettingsEntity} from "../settings/entities/setting.entity";
import {CurrencyEntity} from "../currencies/entities/currency.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([UserEntity, TransactionEntity, SettingsEntity, CurrencyEntity]),
  ],
  controllers: [WalletController],
  providers: [WalletService, UsersService, TransactionsService, SettingsService, CurrenciesService],
})
export class WalletModule {}
