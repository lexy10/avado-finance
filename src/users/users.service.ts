import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {Repository} from "typeorm";

@Injectable()
export class UsersService {

  constructor(
      @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
  ) {
  }
  async createUser(requestParams) {
      const newUser = this.userRepository.create({
        full_name: requestParams.full_name,
        email_address: requestParams.email_address,
        password: requestParams.password,
        verification_code: requestParams.verification_code,
        usdt_wallet_address: requestParams.usdt_wallet_address
      })

      await this.userRepository.save(newUser)

      return newUser
  }

  async verifyUser(user: UserEntity) {
    await this.userRepository.update(
        { id: user.id },
        {
          is_verified: true
        })

    return true
  }


  findAll() {
    return `This action returns all users`;
  }

  async findOne(email_address: string): Promise<UserEntity | undefined> {
    return await this.userRepository.findOneBy({ email_address: email_address });
  }

  async updateWalletAddress(user: UserEntity) {
    return await this.userRepository.save(user);
  }


  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
