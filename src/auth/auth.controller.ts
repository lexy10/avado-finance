import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  login() {
    return this.authService.findAll();
  }

  @Get(':id')
  forgotPassword(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  resetPassword(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  verifyEmail(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
