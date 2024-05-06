import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import {UsersService} from "../users/users.service";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [WalletController],
  providers: [WalletService, UsersService],
})
export class WalletModule {}
