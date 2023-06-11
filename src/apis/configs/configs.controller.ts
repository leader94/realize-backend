import { Controller, Get } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { SkipAuth } from '../auth/jwt-auth.guard';

@Controller('configs')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @SkipAuth()
  @Get('home')
  async getUser() {
    const res = this.configsService.getHomeConfig();
    return res;
  }
}
