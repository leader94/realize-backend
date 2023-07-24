import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { UtilityService } from './utility.service';
import { EmailService } from './email.service';
import { OtpService } from './otp.service';

@Module({
  controllers: [],
  imports: [],
  providers: [
    UtilityService,
    DatabaseService,
    StorageService,
    EmailService,
    OtpService,
  ],
  exports: [
    UtilityService,
    DatabaseService,
    StorageService,
    EmailService,
    OtpService,
  ],
})
export class CommonServices {}
