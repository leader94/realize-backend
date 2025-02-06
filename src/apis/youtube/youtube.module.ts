import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { CommonModule } from 'src/common/commonServices/commonServices.module';
import { YoutubeController } from './youtube.controller';

@Module({
  imports: [CommonModule],
  providers: [YoutubeService],
  controllers: [YoutubeController],
})
export class YouTubeModule {}
