import {Injectable, UnauthorizedException} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from "bcrypt";
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../users/users.service";

@Injectable()
export class AuthService {

  constructor(
      private usersService: UsersService,
      private jwtService: JwtService
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
    const isUserExisting = await this.usersService.findOne(requestParams.email_address)
    if (isUserExisting) {
      return false
    }
    requestParams.password = bcrypt.hashSync(requestParams.password, 10);
    const user = await this.usersService.createUser(requestParams)
    const payload = { sub: user.email_address, username: user.username };
    return await this.jwtService.signAsync(payload)
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
