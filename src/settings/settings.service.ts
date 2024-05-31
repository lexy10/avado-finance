import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsEntity } from './entities/setting.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { CustomException } from '../exceptions/CustomException';
import {HttpService} from "@nestjs/axios";


interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,
    private userService: UsersService,
    private httpService: HttpService
  ) {}

  async getProfile(request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );

    return {
      fullname: user.full_name,
      username: user.username,
      email_address: user.email_address,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
    };
  }

  async updateProfile(request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );

    if (!request.fullname) {
      throw new CustomException('Please input a valid fullname');
    }

    if (!request.username) {
      throw new CustomException('Please input a valid username');
    }

    if (!request.phone_number) {
      throw new CustomException('Please input a valid phone number');
    }

    if (!request.date_of_birth) {
      throw new CustomException('Please input a valid date of birth');
    }

    user.full_name = request.fullname;
    user.username = request.username;
    user.phone_number = request.phone_number;
    user.date_of_birth = request.date_of_birth;

    return await this.userService.updateUser(user);
  }

  async updatePassword(request: any) {
    if (!request.old_password) {
      throw new CustomException('Current password field required');
    }

    if (!request.new_password) {
      throw new CustomException('New password field required');
    }

    if (!request.confirm_new_password) {
      throw new CustomException('Confirm new password field required');
    }

    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );

    //const { password, ...result } = user;
    const match = await bcrypt.compare(request.old_password, user.password);

    if (!match) throw new CustomException('Current password incorrect');

    if (request.new_password !== request.confirm_new_password)
      throw new CustomException('New Password does not match');

    user.password = bcrypt.hashSync(request.new_password, 10);

    return await this.userService.updateUser(user);
  }

  async getReferrals(request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );
    //const referralsData = await this.userService.findReferrals(user);
    return {
      referral_code: user.referral_code,
      referral_bonus: user.referral_bonus_balance,
      referral_total_balance: user.referral_bonus_balance,
      referral_count: user.referral_count,
    };
  }

  async getBankAccount(userRequest: any) {
    const user = await this.userService.findOneByEmail(
      userRequest.user.email_address,
    );
    if (!user.bank_name || !user.account_name || !user.account_number) {
      return {
        status: false,
      };
    } else {
      return {
        status: true,
        data: {
          bank_name: user.bank_name,
          account_name: user.account_name,
          account_number: user.account_number,
        },
      };
    }
  }

  async updateBankAccount(request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );
    if (!request.bank_name) throw new CustomException('Bank name required');

    if (!request.account_name)
      throw new CustomException('Account name required');

    if (!request.account_number)
      throw new CustomException('Account number required');

    user.bank_name = request.bank_name;
    user.account_name = request.account_name;
    user.account_number = request.account_number;

    return await this.userService.updateUser(user);
  }

  async removeBankAccount(request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );

    user.bank_name = null;
    user.account_name = null;
    user.account_number = null;

    return await this.userService.updateUser(user);
  }

  async getVerificationStatus(request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );
    return user.verification_status;
  }

  async submitVerification(files: MulterFile[], request: any) {
    const user = await this.userService.findOneByEmail(
      request.user.email_address,
    );

    const verificationIdImage = files.find(file => file.fieldname === 'verification_id_image');
    const verificationLivelinessImage = files.find(file => file.fieldname === 'verification_liveliness_image');

    if (!verificationIdImage) {
      throw new CustomException('Verification ID image required');
    }

    if (!verificationLivelinessImage) {
      throw new CustomException('Verification liveliness image required');
    }

    try {
      const formData = new FormData();
      formData.append('image', verificationIdImage.buffer.toString('base64'));
      const response1 = await this.httpService.post(`https://api.imgbb.com/1/upload?expiration=600&key=6a9403de70b295df735a0567a805019c`, formData).toPromise()
      user.verification_id_image = response1.data.data.url
    } catch (error) {
      // Handle error
      throw new CustomException('Failed to post data to external API');
    }

    try {
      const formData = new FormData();
      formData.append('image', verificationLivelinessImage.buffer.toString('base64'));
      const response2 = await this.httpService.post(`https://api.imgbb.com/1/upload?expiration=600&key=6a9403de70b295df735a0567a805019c`, formData).toPromise()
      user.verification_liveliness_image = response2.data.data.url
    } catch (error) {
      // Handle error
      throw new CustomException('Failed to post data to external API');
    }

    user.verification_status = 'pending';

    return await this.userService.updateUser(user);

  }
}
