import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import {UserEntity} from "./users/entities/user.entity";
import {EmailService} from "./email/email.service";
import {AuthMiddleware} from "./auth.middleware";
import { WalletModule } from './wallet/wallet.module';
import {TransactionEntity} from "./transactions/entities/transaction.entity";
import { P2pModule } from './p2p/p2p.module';
import {P2pEntity} from "./p2p/entities/p2p.entity";
import { DashboardModule } from './dashboard/dashboard.module';
import {PriceFetcherCron} from "./priceFetcher.cron";
import {ScheduleModule} from "@nestjs/schedule";
import { SettingsModule } from './settings/settings.module';
import {SettingsEntity} from "./settings/entities/setting.entity";
import {WalletEntity} from "./wallet/entities/wallet.entity";
import {SettingsService} from "./settings/settings.service";
import { CurrenciesModule } from './currencies/currencies.module';
import {CurrenciesService} from "./currencies/currencies.service";
import {CurrencyEntity} from "./currencies/entities/currency.entity";
import {JwtModule} from "@nestjs/jwt";

@Module({
  imports: [
    ConfigModule.forRoot(),
    //HttpModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10d' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [UserEntity, TransactionEntity, SettingsEntity, WalletEntity, CurrencyEntity],
      //entities: [__dirname + '/**/*.entity{.ts,.js}', __dirname + '/entities/*.entity{.ts,.js}'],

      //migrationsTableName: 'migration',
      migrations: ['src/migration/*.ts'],
      ssl: false,
      synchronize: true, // Set to true if you want TypeORM to synchronize the database schema automatically
    }),
    TypeOrmModule.forFeature([UserEntity, TransactionEntity, P2pEntity, SettingsEntity, CurrencyEntity]),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    TransactionsModule,
    WalletModule,
    P2pModule,
    DashboardModule,
    SettingsModule,
    CurrenciesModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, SettingsService, CurrenciesService, PriceFetcherCron],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply AuthMiddleware to the routes you want to protect
    consumer
        .apply(AuthMiddleware)
        .forRoutes('/transactions*', '/users*', '/wallets*', '/p2p*', '/dashboard*', '/auth/verify');
  }
}
