import {Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, Put} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import {Request, Response} from "express";

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  async getProfile(@Req() request: Request, @Res() response: Response) {

  }

  @Patch()
  async updateProfile(@Req() request: Request, @Res() response: Response) {

  }

  @Put()
  async changePassword(@Req() request: Request, @Res() response: Response) {

  }

  @Get()
  async getBankAccounts(@Req() request: Request, @Res() response: Response) {

  }

  @Post()
  async addBankAccount(@Req() request: Request, @Res() response: Response) {

  }

  @Delete()
  async removeBankAccount(@Req() request: Request, @Res() response: Response) {

  }



  @Get()
  async findAll(@Req() request: Request, @Res() response: Response) {
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(+id, updateSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(+id);
  }
}
