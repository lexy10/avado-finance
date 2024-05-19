import {Injectable} from '@nestjs/common';
import {CreateSettingDto} from './dto/create-setting.dto';
import {UpdateSettingDto} from './dto/update-setting.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {SettingsEntity} from "./entities/setting.entity";
import {Repository} from "typeorm";
import * as bcrypt from "bcrypt";
import axios from "axios";
import {UsersService} from "../users/users.service";
import {CustomException} from "../exceptions/CustomException";

@Injectable()
export class SettingsService {

  constructor(
      @InjectRepository(SettingsEntity) private settingsRepository: Repository<SettingsEntity>,
      private userService: UsersService
  ) {
  }

  async getProfile(request: any) {
    const user = await this.userService.findOneByEmail(request.user.email_address)

    return {
      fullname: user.full_name,
      username: user.username,
      email_address: user.email_address,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth
    }
  }

  async updateProfile(request: any) {
    const user = await this.userService.findOneByEmail(request.user.email_address)

    if (!request.fullname) {
      throw new CustomException("Please input a valid fullname")
    }

    if (!request.username) {
      throw new CustomException("Please input a valid username")
    }

    if (!request.phone_number) {
      throw new CustomException("Please input a valid phone number")
    }

    if (!request.date_of_birth) {
      throw new CustomException("Please input a valid date of birth")
    }

    user.full_name = request.fullname
    user.username = request.username
    user.phone_number = request.phone_number
    user.date_of_birth = request.date_of_birth

    return await this.userService.updateUser(user)

  }

  async updatePassword(request: any) {
    if (!request.old_password) {
      throw new CustomException('Current password field required')
    }

    if (!request.new_password) {
      throw new CustomException('New password field required')
    }

    if (!request.confirm_new_password) {
      throw new CustomException('Confirm new password field required')
    }

    const user = await this.userService.findOneByEmail(request.user.email_address)

    //const { password, ...result } = user;
    const match = await bcrypt.compare(request.old_password, user.password);

    if (!match)
      throw new CustomException("Current password incorrect")

    if (request.new_password !== request.confirm_new_password)
      throw new CustomException("New Password does not match")

    user.password = bcrypt.hashSync(request.new_password, 10);

    return await this.userService.updateUser(user)
  }

  async getReferrals(request: any) {
    console.log("got here with: ", request)
    const user = await this.userService.findOneByEmail(request.user.email_address)
    const referralsData = await this.userService.findReferrals(user)
      return {
        referral_code: user.referral_code,
        referral_bonus: user.referral_bonus,
        referrals: referralsData.map(referral => ({
          name: referral.full_name
        }))
      }
  }

  async getBankAccount(userRequest: any) {
    const user = await this.userService.findOneByEmail(userRequest.user.email_address)
    if (!user.bank_name || !user.account_name || !user.account_number) {
      return {
        status: false
      }
    } else {
      return {
        status: true,
        data: {
          bank_name: user.bank_name,
          account_name: user.account_name,
          account_number: user.account_number
        }
      }
    }
  }

  async updateBankAccount(request: any) {
    const user = await this.userService.findOneByEmail(request.user.email_address)
    if (!request.bank_name)
      throw new CustomException('Bank name required')

    if (!request.account_name)
      throw new CustomException('Account name required')

    if (!request.account_number)
      throw new CustomException('Account number required')

    user.bank_name = request.bank_name
    user.account_name = request.account_name
    user.account_number = request.account_number

    return await this.userService.updateUser(user)
  }

  async removeBankAccount(request: any) {
    const user = await this.userService.findOneByEmail(request.user.email_address)

    user.bank_name = null
    user.account_name = null
    user.account_number = null

    return await this.userService.updateUser(user)
  }

  async getVerificationStatus(request: any) {
    const user = await this.userService.findOneByEmail(request.user.email_address)
    return user.verification_status
  }

  async submitVerification(request: any) {
    const user = await this.userService.findOneByEmail(request.user.email_address)

    user.verification_id_image = request.verification_id_image
    user.verification_liveliness_image = request.verification_liveliness_image
    user.verification_status = 'pending'

    return await this.userService.updateUser(user)
  }

  create(createSettingDto: CreateSettingDto) {
    return 'This action adds a new setting';
  }

  findAll() {
    return `This action returns all settings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return `This action updates a #${id} setting`;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
