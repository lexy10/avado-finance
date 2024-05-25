import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { SettingsEntity } from '../settings/entities/setting.entity';
import { CurrencyEntity } from './entities/currency.entity';
import { CurrencyNetworkEntity } from './entities/currency_networks.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([CurrencyEntity, CurrencyNetworkEntity]),
  ],
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
})
export class CurrenciesModule {}
