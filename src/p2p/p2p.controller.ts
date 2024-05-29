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
} from '@nestjs/common';
import { P2pService } from './p2p.service';
import { CreateP2pDto } from './dto/create-p2p.dto';
import { UpdateP2pDto } from './dto/update-p2p.dto';
import { Request, Response } from 'express';

@Controller('p2p')
export class P2pController {
  constructor(private readonly p2pService: P2pService) {}

  @Get()
  async loadAccounts(@Req() request: Request, @Res() response: Response) {
    try {
      const accounts = await this.p2pService.loadAccounts();
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Accounts loaded successfully',
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }
}
