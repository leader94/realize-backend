import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
// import { getUUID } from '../../common/utils';
import { multerOptions } from './mutler.config';
import { v4 as uuid } from 'uuid';

@Controller('base')
export class BaseUploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
      baseId: uuid(),
      url: `/${file.filename}`,
    };
    return response;
  }
}
