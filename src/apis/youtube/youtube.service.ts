import { Injectable } from '@nestjs/common';
import { HttpService } from 'src/common/commonServices/http.service';
import { HttpHelperService } from 'src/common/commonServices/httpHelper.service';
import { YoutubeVideoSearchResponse } from './types/searchResponse.type';

@Injectable()
export class YoutubeService {
  constructor(
    private readonly httpService: HttpService,
    private readonly httpHelperService: HttpHelperService
  ) {}
  async searchVideos(query: string): Promise<any> {
    try {
      const apiKey = 'AIzaSyCPTzrX9-zvfwpQCd2g8bmuIMT8VEPwifU';

      const queryParams = this.httpHelperService.generateQueryParams({
        maxResults: 10,
        part: 'snippet',
        q: query,
        type: 'video',
        key: apiKey,
      });

      const apiUrl = `https://www.googleapis.com/youtube/v3/search${queryParams}`;

      const videos: YoutubeVideoSearchResponse = await this.httpService.get(
        apiUrl
      );
      console.log(videos);

      const videosList = videos.items.map((item) => {
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          thumbnails: item.snippet.thumbnails.medium.url,
        };
      });

      return { items: videosList, size: videosList.length };
    } catch (error) {
      return { items: [], size: 0 };
      //   throw new Error(`Failed to fetch YouTube data: ${error.message}`);
    }
  }
}
