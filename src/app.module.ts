import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot(),
    //HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [UserEntity, TransactionEntity],
      //entities: [__dirname + '/**/*.entity{.ts,.js}', __dirname + '/entities/*.entity{.ts,.js}'],

      //migrationsTableName: 'migration',
      migrations: ['src/migration/*.ts'],
      ssl: false,
      synchronize: true, // Set to true if you want TypeORM to synchronize the database schema automatically
    }),
    TypeOrmModule.forFeature([UserEntity, TransactionEntity, P2pEntity]),
    UsersModule,
    AuthModule,
    TransactionsModule,
    WalletModule,
    P2pModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply AuthMiddleware to the routes you want to protect
    consumer
        .apply(AuthMiddleware)
        .forRoutes('/transactions/*');
  }
}
