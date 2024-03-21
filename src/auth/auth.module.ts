import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {JwtModule} from "@nestjs/jwt";
import {UsersModule} from "../users/users.module";
import {UsersService} from "../users/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
})
export class AuthModule {}
