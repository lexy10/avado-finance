import { Module } from '@nestjs/common';
import { P2pService } from './p2p.service';
import { P2pController } from './p2p.controller';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyEntity } from '../currencies/entities/currency.entity';
import { P2pEntity } from './entities/p2p.entity';
import { UserEntity } from '../users/entities/user.entity';
import { SettingsService } from '../settings/settings.service';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { SettingsEntity } from '../settings/entities/setting.entity';
import {CurrenciesService} from "../currencies/currencies.service";
import {CurrencyNetworkEntity} from "../currencies/entities/currency_networks.entity";
import {WalletService} from "../wallet/wallet.service";
import {WalletEntity} from "../wallet/entities/wallet.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      CurrencyEntity,
      P2pEntity,
      UserEntity,
      TransactionEntity,
      SettingsEntity,
        CurrencyNetworkEntity,
        WalletEntity
    ]),
  ],
  controllers: [P2pController],
  providers: [P2pService, UsersService, TransactionsService, SettingsService, CurrenciesService, WalletService],
})
export class P2pModule {}
