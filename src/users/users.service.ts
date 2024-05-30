import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CustomException } from '../exceptions/CustomException';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}
  async createUser(requestParams) {
    const newUser = this.userRepository.create({
      full_name: requestParams.full_name,
      email_address: requestParams.email_address,
      password: requestParams.password,
      verification_code: requestParams.verification_code,
      referral_code: requestParams.referral_code,
      referrerId: requestParams.referrer,
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  async verifyUser(user: UserEntity) {
    return await this.userRepository.update(
      { id: user.id },
      {
        is_verified: true,
      },
    );
  }

  async getUserWallets(email: string): Promise<UserEntity> {
    const entity = await this.userRepository.find({
      where: { email_address: email },
    });

    return entity[0]; // Assuming you only expect one entity
  }

  async getReferrer(referralCode: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ referral_code: referralCode });
  }

  async findOneByEmail(email_address: string): Promise<any> {
    if (!email_address)
      throw new CustomException('Email address is undefined!');

    return await this.userRepository.findOneBy({
      email_address: email_address,
    });
  }

  async allUsers() {
    return await this.userRepository.find();
  }

  async findPasswordResetValidity(
    email_address: string,
    token: string,
  ): Promise<any> {
    if (!email_address)
      throw new CustomException('Email address is undefined!');

    if (!token) throw new CustomException('Password token is undefined!');

    return await this.userRepository.findOneBy({
      email_address: email_address,
      password_token: token,
    });
  }

  async findOneById(id: any): Promise<any> {
    if (!id) throw new CustomException('ID is undefined!');

    return await this.userRepository.findOneBy({ id: id });
  }

  async updateUser(user: UserEntity) {
    return await this.userRepository.save(user);
  }
}
