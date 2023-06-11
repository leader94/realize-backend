import { Body, Controller, Post, Request } from '@nestjs/common';
import { SignedLinksService } from './signed-links.service';
import { TsignedLinksBody } from './signed-links.types';

@Controller('signedlink')
export class SignedLinksController {
  constructor(private readonly signedLinksService: SignedLinksService) {}
  @Post()
  async generateSignedLink(@Body() body: TsignedLinksBody, @Request() req) {
    const res = await this.signedLinksService.generateSignedLink(
      body,
      req.user
    );
    return res;
  }
}
