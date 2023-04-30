import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { multerOptions } from './mutler.config';

@Controller('overlay')
export class OverlayUploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(extname(file.originalname));
    const response = {
      originalname: file.originalname,
      filename: file.filename,
      url: `/${file.filename}`,
    };
    return response;
  }
}
