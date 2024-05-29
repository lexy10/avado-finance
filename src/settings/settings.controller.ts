import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpStatus,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Request, Response } from 'express';
import { CustomException } from '../exceptions/CustomException';
import { isBase64 } from '../utils/base64.util';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('/profile')
  async getProfile(@Req() request: Request, @Res() response: Response) {
    try {
      const profile = await this.settingsService.getProfile(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Profile fetched successfully',
        data: profile,
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }

  @Post('/update-profile')
  async updateProfile(@Req() request: Request, @Res() response: Response) {
    try {
      const updatedProfile = await this.settingsService.updateProfile(
        request.body,
      );
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }

  @Post('/update-password')
  async updatePassword(@Req() request: Request, @Res() response: Response) {
    try {
      const updatedPassword = await this.settingsService.updatePassword(
        request.body,
      );
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Password updated successfully',
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }

  @Get('/bank-details')
  async getBankAccount(@Body() requestBody: Body, @Res() response: Response) {
    try {
      const bankAccount =
        await this.settingsService.getBankAccount(requestBody);
      if (!bankAccount.status) {
        response.status(HttpStatus.OK).json({
          status: false,
          message: 'Bank details not added yet',
        });
      } else {
        response.status(HttpStatus.OK).json({
          status: true,
          message: 'Bank details fetched successfully',
          bank_details: bankAccount,
        });
      }
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }

  @Post('/bank-details/add')
  async addBankAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const bankAccount = await this.settingsService.updateBankAccount(
        request.body,
      );
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Bank details added successfully',
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }

  @Post('/bank-details/update')
  async updateBankAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const bankAccount = await this.settingsService.updateBankAccount(
        request.body,
      );
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Bank details updated successfully',
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }

  @Delete('/bank-details/remove')
  async removeBankAccount(@Req() request: Request, @Res() response: Response) {
    try {
      const bankAccount = await this.settingsService.removeBankAccount(
        request.body,
      );
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Bank account removed successfully',
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }

  @Get('/referrals')
  async getReferrals(@Req() request: Request, @Res() response: Response) {
    try {
      const referrals = await this.settingsService.getReferrals(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Referrals fetched successfully',
        data: referrals,
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }

  @Get('/verification-status')
  async getVerificationStatus(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const verification_status =
        await this.settingsService.getVerificationStatus(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Verification status fetched successfully',
        verification_status: verification_status,
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }
  @Post('/submit-verification')
  async submitVerification(@Req() request: Request, @Res() response: Response) {
    try {
      const requestBody = request.body;
      if (!requestBody.verification_id_image)
        throw new BadRequestException('Verification ID image required');

      if (!requestBody.verification_liveliness_image)
        throw new BadRequestException('Verification liveliness image Required');

      if (
        !isBase64(requestBody.verification_id_image) ||
        !isBase64(requestBody.verification_liveliness_image)
      )
        throw new BadRequestException('Image must be in base64 format');

      const submittedVerification =
        await this.settingsService.submitVerification(requestBody);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Verification submitted successfully',
      });
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: e.message,
      });
    }
  }
}
