import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { SkipAuth } from './jwt-auth.guard';
import { TGetOtpDto } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @UseGuards(LocalAuthGuard) // login or signUp logic in Guard
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // TODO  add DDOS attack prevention here
  @SkipAuth()
  @Get('/otp')
  getOTP(@Request() req, @Body() body: TGetOtpDto) {
    return this.authService.getOTP(body);
  }
}
