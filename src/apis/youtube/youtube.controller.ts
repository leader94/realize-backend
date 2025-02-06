// youtube.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('search')
  async searchVideos(@Query('query') query: string): Promise<any> {
    try {
      const videos = await this.youtubeService.searchVideos(query);
      return videos;
    } catch (error) {
      return { error: error.message };
    }
  }
}
