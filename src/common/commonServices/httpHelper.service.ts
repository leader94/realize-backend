import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpHelperService {
  generateQueryParams(params: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const queryParams = Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&');

    return `?${queryParams}`;
  }
}
