import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {JwtModule} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";
import {ConfigModule} from "@nestjs/config";
import {EmailService} from "../email/email.service";
import {EmailModule} from "../email/email.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10d' },
    }),
    TypeOrmModule.forFeature([UserEntity]),
      EmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, EmailService],
})
export class AuthModule {}
