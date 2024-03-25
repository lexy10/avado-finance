import {Injectable} from '@nestjs/common';
import {UpdateAuthDto} from './dto/update-auth.dto';
import * as bcrypt from "bcrypt";
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";
import {EmailService} from "../email/email.service";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../users/entities/user.entity";
import {Repository} from "typeorm";

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
    const user = await this.usersService.findOne(requestBody.email_address);
    if (user) {
      //const { password, ...result } = user;
      const match = await bcrypt.compare(requestBody.password, user.password);

      /*if(match) {
        return {
          user: user,
          token: this.randomAsciiString(36)
        }
      }*/
      if (!match) {
        //throw new UnauthorizedException();
        return false
      }
      const payload = { sub: user.email_address, username: user.username };
      return await this.jwtService.signAsync(payload)
    } else {
      return false
    }
  }


  async register(requestParams) {
    try {
      const isUserExisting = await this.usersService.findOne(requestParams.email_address)
      if (isUserExisting) {
        return false
      }
      requestParams.password = bcrypt.hashSync(requestParams.password, 10);
      let code = Math.floor(10000 + Math.random() * 90000).toString()
      requestParams.verification_code = code
      const user = await this.usersService.createUser(requestParams)
      const payload = {sub: user.email_address, username: user.username};
      await this.emailService.sendUserConfirmation(user, code)
      return await this.jwtService.signAsync(payload)
    } catch (e) {
      return e
    }
  }

  async verifyAccount(requestParams) {
    const isUserExisting = await this.usersService.findOne(requestParams.email_address)
    if (isUserExisting) {
      if (requestParams.code == isUserExisting.verification_code) {
        await this.usersService.verifyUser(isUserExisting)
        return {
          status: true,
        }
      } else {
        return {
          status: false,
          message: "Invalid verification code"
        }
      }
    } else {
      return {
        status: false,
        message: "Invalid user account"
      }
    }
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
