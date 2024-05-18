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

  @Get('/profile')
  async getProfile(@Req() request: Request, @Res() response: Response) {
    try {
      const profile = await this.settingsService.getProfile(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Profile fetched successfully',
        data: profile
      })
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message
      })
    }
  }

  @Patch('/update-profile')
  async updateProfile(@Req() request: Request, @Res() response: Response) {
    try {
      const updatedProfile = await this.settingsService.updateProfile(request.body)
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      })
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message
      })
    }
  }

  @Patch('/update-password')
  async updatePassword(@Req() request: Request, @Res() response: Response) {
      try {
        const updatedPassword = await this.settingsService.updatePassword(request.body)
        response.status(HttpStatus.OK).json({
          status: true,
          message: 'Password updated successfully',
        })
      } catch (e) {
        response.status(HttpStatus.NOT_FOUND).json({
          status: false,
          message: e.message
        })
      }
  }

  @Get('/bank-details')
  async getBankAccount(@Body() requestBody: Body, @Res() response: Response, ) {
      try {
        const bankAccount = await this.settingsService.getBankAccount(requestBody)
        response.status(HttpStatus.OK).json({
          status: true,
          message: 'Bank details fetched successfully',
          bank_details: bankAccount
        })
      } catch (e) {
        response.status(HttpStatus.NOT_FOUND).json({
          status: false,
          message: e.message
        })
      }
  }

  @Post('/bank-details/add')
  async addBankAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const bankAccount = await this.settingsService.updateBankAccount(request.body)
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Bank details added successfully',
      })
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message
      })
    }
  }

  @Post('/bank-details/update')
  async updateBankAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const bankAccount = await this.settingsService.updateBankAccount(request.body)
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Bank details updated successfully',
      })
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message
      })
    }
  }

  @Delete('/bank-details/remove')
  async removeBankAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const bankAccount = await this.settingsService.removeBankAccount(request.body)
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Bank account removed successfully',
      })
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message
      })
    }
  }

  @Get('/referrals')
  async getReferrals(@Req() request: Request, @Res() response: Response) {
    try {
      const referrals = await this.settingsService.getReferrals(request.body)
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Referrals fetched successfully',
        data: referrals
      })
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message
      })
    }
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
