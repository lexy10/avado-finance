import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import {UserEntity} from "./users/entities/user.entity";
import { EmailModule } from './email/email.module';
import {EmailService} from "./email/email.service";
import {SendGridClient} from "./email/sendgrid-client";

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
      entities: [UserEntity],
      //entities: [__dirname + '/**/*.entity{.ts,.js}', __dirname + '/entities/*.entity{.ts,.js}'],

      //migrationsTableName: 'migration',
      migrations: ['src/migration/*.ts'],
      ssl: false,
      synchronize: true, // Set to true if you want TypeORM to synchronize the database schema automatically
    }),
    //TypeOrmModule.forFeature([TradeEntity, SettingsEntity, AccountEntity, AccountOwnerEntity, InstrumentEntity]),
    UsersModule,
    AuthModule,
    TransactionsModule,
    EmailModule
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, SendGridClient],
})
export class AppModule {}
