import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/common/commonServices/email.service';
import { OtpService } from 'src/common/commonServices/otp.service';
import { TGetOtpDto } from './auth.types';
import { CacheService } from 'src/common/commonServices/cache/cache.service';
import { UtilityService } from 'src/common/commonServices/utility.service';
import CacheConstants from 'src/common/constants/cache.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly cacheService: CacheService,
    private readonly utilityService: UtilityService
  ) {}

  async validateLogin(id: string, pass: string): Promise<any> {
    const loginDetails = await this.usersService.findOrCreateLoginDetails(
      id,
      pass
    );
    return loginDetails || null;
  }

  async login(user: any) {
    if (!user) throw new UnauthorizedException();

    const payload = { username: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  public async getOTP(body: TGetOtpDto) {
    // TODO handle mob vs email
    if (!body.email) {
      throw new HttpException(
        `EmailId not found  in request`,
        HttpStatus.BAD_REQUEST
      );
    }
    if (!this.utilityService.isValidEmail(body.email)) {
      throw new HttpException(
        `EmailId is not a valid email address`,
        HttpStatus.BAD_REQUEST
      );
    }
    const otp = this.otpService.generateOTP();
    try {
      // store in DB
      await this._storeOTPInCache(body.email, otp);
      // calling async method without await to return response early
      this.emailService.sendEmail({ OTP: otp, to: body.email });

      return {
        status: 'success',
        res: {
          msg: `OTP sent to ${body.email}`,
          validity: CacheConstants.OTP_EXPIRY_TIME,
        },
      };
    } catch (e) {
      throw e;
    }
  }

  private async _storeOTPInCache(email: string, otp: string) {
    {
      try {
        await this.cacheService.putEntity(
          email + '_otp',
          JSON.stringify({ otp }),
          {
            EX: CacheConstants.OTP_EXPIRY_TIME,
          }
        );
      } catch (e) {
        throw e;
      }
    }
  }
}
