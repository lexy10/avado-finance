import {Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus} from '@nestjs/common';
import { P2pService } from './p2p.service';
import { CreateP2pDto } from './dto/create-p2p.dto';
import { UpdateP2pDto } from './dto/update-p2p.dto';
import {Request, Response} from "express";

@Controller('p2p')
export class P2pController {
  constructor(private readonly p2pService: P2pService) {}

  @Get()
  async loadAccounts(@Req() request: Request, @Res() response: Response) {
    try {
      const accounts = await this.p2pService.loadAccounts()
      response.status(HttpStatus.OK).json({
        status: true,
        message: "Accounts loaded successfully"
      })
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message
      })
    }
  }

  @Post()
  create(@Body() createP2pDto: CreateP2pDto) {
    return this.p2pService.create(createP2pDto);
  }

  @Get()
  findAll() {
    return this.p2pService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.p2pService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateP2pDto: UpdateP2pDto) {
    return this.p2pService.update(+id, updateP2pDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.p2pService.remove(+id);
  }
}
