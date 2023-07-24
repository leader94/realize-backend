import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

type TOtpGeneratorOptions = {
  digits: boolean;
  lowerCaseAlphabets: boolean;
  upperCaseAlphabets: boolean;
  specialChars: boolean;
};

@Injectable()
export class OtpService {
  public generateOTP() {
    const OTP = this._generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    return OTP;
  }

  /**
   * Generate OTP of the length
   * @param  {number} length length of password.
   * @param  {object} options
   * @param  {boolean} options.digits Default: `true` true value includes digits in OTP
   * @param  {boolean} options.lowerCaseAlphabets Default: `true` true value includes lowercase alphabets in OTP
   * @param  {boolean} options.upperCaseAlphabets Default: `true` true value includes uppercase alphabets in OTP
   * @param  {boolean} options.specialChars Default: `true` true value includes specialChars in OTP
   */

  private _generate(length: number, options: TOtpGeneratorOptions): string {
    const digits = '0123456789';
    const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseAlphabets = lowerCaseAlphabets.toUpperCase();
    const specialChars = '#!&@';

    length = length || 10;
    const generateOptions = options || {
      digits: true,
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: true,
    };

    const allowsChars =
      ((generateOptions.digits || '') && digits) +
      ((generateOptions.lowerCaseAlphabets || '') && lowerCaseAlphabets) +
      ((generateOptions.upperCaseAlphabets || '') && upperCaseAlphabets) +
      ((generateOptions.specialChars || '') && specialChars);
    let password = '';
    while (password.length < length) {
      // TODO convert to async function
      const charIndex = randomInt(0, allowsChars.length);
      if (
        password.length === 0 &&
        generateOptions.digits === true &&
        allowsChars[charIndex] === '0'
      ) {
        continue;
      }
      password += allowsChars[charIndex];
    }
    return password;
  }
}
