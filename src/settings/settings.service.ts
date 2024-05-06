import {Injectable} from '@nestjs/common';
import {CreateSettingDto} from './dto/create-setting.dto';
import {UpdateSettingDto} from './dto/update-setting.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {SettingsEntity} from "./entities/setting.entity";
import {Repository} from "typeorm";
import axios from "axios";

@Injectable()
export class SettingsService {

  constructor(
      @InjectRepository(SettingsEntity) private settingsRepository: Repository<SettingsEntity>,
  ) {
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
