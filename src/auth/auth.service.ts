import {Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import axios from 'axios';
import qs from 'qs';
import {UpdateAuthDto} from './dto/update-auth.dto';
import * as bcrypt from "bcrypt";
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";
import {EmailService} from "../email/email.service";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";
import {Repository} from "typeorm";
import { generateRandomRefCode } from '../utils';
import {CustomException} from "../exceptions/CustomException";

@Injectable()
export class AuthService {

  constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
      private emailService: EmailService,
      @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
  ) {
    //this.createUser().then(r => {})
  }

  async login(requestBody): Promise<any> {
    const user = await this.usersService.findOneByEmail(requestBody.email_address);

    if (!user)
      throw new UnauthorizedException("Invalid login details")

      //const { password, ...result } = user;
      const match = await bcrypt.compare(requestBody.password, user.password);

      if (!match)
        throw new UnauthorizedException("Invalid login details")

      const payload = {
        sub: user.email_address,
        id: user.id,
        iss: 'AvadoAuth',
        username: user.username,
        email_address: user.email_address,
        user_role: user.user_role
      };
      const token = await this.jwtService.signAsync(payload)
      return {
        user_role: user.user_role,
        is_verified: user.is_verified,
        token: token
      }
  }

  async register(requestParams) {
      const isUserExisting = await this.usersService.findOneByEmail(requestParams.email_address)
      if (isUserExisting)
        throw new CustomException("User account already exists")

      requestParams.password = bcrypt.hashSync(requestParams.password, 10);
      let code = Math.floor(10000 + Math.random() * 90000).toString()
      requestParams.verification_code = code
      requestParams.referral_code = await this.generateUniqueRefCode()

      //get referrer
      const referrerUser = await this.usersService.getReferrer(requestParams.referrer_code)
      if (requestParams.referrer_code && referrerUser)
        requestParams.referrer = referrerUser
    else
      requestParams.referrer = null


      const user = await this.usersService.createUser(requestParams)

      const payload = {sub: user.email_address, username: user.username};
      await this.emailService.sendUserConfirmation(user, code)
      return await this.jwtService.signAsync(payload)
  }

  async generateUniqueRefCode(): Promise<string> {
    let refCode: string;

    // Loop until a unique refCode is generated
    do {
      // Generate a new 6-character refCode
      refCode = generateRandomRefCode(9);

      // Check if refCode already exists in the database
      const existingRefCode = await this.userRepository.findOneBy({ referral_code: refCode });

      // If refCode does not exist, break out of the loop
      if (!existingRefCode) {
        break;
      }
    } while (true);

    return refCode;
  }

  async verifyAccount(requestParams) {
    const isUserExisting = await this.usersService.findOneByEmail(requestParams.user.email_address)

    if (!isUserExisting)
      throw new NotFoundException("Invalid user account")

    if (requestParams.code != isUserExisting.verification_code)
      throw new CustomException("Invalid verification code")

      return await this.usersService.verifyUser(isUserExisting)
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
