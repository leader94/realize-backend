import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { UtilityService } from './utility.service';
import { EmailService } from './email.service';
import { OtpService } from './otp.service';
import { HttpService } from './http.service';
import { HttpHelperService } from './httpHelper.service';

@Module({
  controllers: [],
  imports: [],
  providers: [
    UtilityService,
    DatabaseService,
    StorageService,
    EmailService,
    OtpService,
    HttpService,
    HttpHelperService,
  ],
  exports: [
    UtilityService,
    DatabaseService,
    StorageService,
    EmailService,
    OtpService,
    HttpService,
    HttpHelperService,
  ],
})
export class CommonModule {}
