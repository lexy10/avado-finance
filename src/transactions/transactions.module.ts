import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import {UsersService} from "../users/users.service";
import {ConfigModule} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";
import {EmailModule} from "../email/email.module";
import {TransactionEntity} from "./entities/transaction.entity";
import {SettingsService} from "../settings/settings.service";
import {SettingsEntity} from "../settings/entities/setting.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([UserEntity, TransactionEntity, SettingsEntity]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, UsersService, SettingsService],
})
export class TransactionsModule {}
