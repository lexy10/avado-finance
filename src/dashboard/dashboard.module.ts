import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SettingsEntity } from '../settings/entities/setting.entity';
import { SettingsService } from '../settings/settings.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { CurrencyEntity } from '../currencies/entities/currency.entity';
import { CurrencyNetworkEntity } from '../currencies/entities/currency_networks.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      UserEntity,
      SettingsEntity,
      CurrencyEntity,
      CurrencyNetworkEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    UsersService,
    SettingsService,
    CurrenciesService,
  ],
})
export class DashboardModule {}
