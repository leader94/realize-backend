import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
// import { getUUID } from '../../common/utils';
import { multerOptions } from './mutler.config';
import { v4 as uuid } from 'uuid';
import { StorageService } from 'src/common/commonServices/storage.service';

@Controller('base')
export class BaseUploadController {
  constructor(private readonly s3Service: StorageService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileId = uuid();

    const res = await this.s3Service.getSignedUploadPath({
      key: fileId,
      contentSize: file.size,
    });
    const response = {
      originalname: file.originalname,
      filename: file.filename,
      baseId: fileId,
      url: `/${file.filename}`,
      ...res,
    };
    return response;
  }
}
