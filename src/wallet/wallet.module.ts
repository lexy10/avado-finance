import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { UsersService } from '../users/users.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { SettingsService } from '../settings/settings.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { SettingsEntity } from '../settings/entities/setting.entity';
import { CurrencyEntity } from '../currencies/entities/currency.entity';
import { P2pService } from '../p2p/p2p.service';
import { P2pEntity } from '../p2p/entities/p2p.entity';
import { WalletEntity } from './entities/wallet.entity';
import { CurrencyNetworkEntity } from '../currencies/entities/currency_networks.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      UserEntity,
      TransactionEntity,
      SettingsEntity,
      CurrencyEntity,
      P2pEntity,
      WalletEntity,
      CurrencyNetworkEntity,
    ]),
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    UsersService,
    TransactionsService,
    SettingsService,
    CurrenciesService,
    P2pService,
  ],
})
export class WalletModule {}
