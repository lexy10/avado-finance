import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";
import {UsersService} from "../users/users.service";
import {SettingsEntity} from "../settings/entities/setting.entity";
import {SettingsService} from "../settings/settings.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([UserEntity, SettingsEntity]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, UsersService, SettingsService],
})
export class DashboardModule {}
