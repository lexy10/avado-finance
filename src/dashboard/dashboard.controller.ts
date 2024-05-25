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
import { DashboardService } from './dashboard.service';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Request, Response } from 'express';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create() {
    return this.dashboardService.create();
  }

  @Get('home')
  async home(@Req() request: Request, @Res() response: Response) {
    try {
      const home = await this.dashboardService.home(request.body);
      response.status(HttpStatus.OK).json({
        status: true,
        message: 'Dashboard Data Fetched',
        data: home,
      });
    } catch (error) {
      response.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: error.message,
      });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(+id, updateDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardService.remove(+id);
  }
}
