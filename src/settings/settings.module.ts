import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsEntity } from './entities/setting.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([SettingsEntity, UserEntity]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, UsersService],
})
export class SettingsModule {}
