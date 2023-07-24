import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {
    super({ usernameField: 'id', passwordField: 'pass' });
  }

  async validate(id: string, pass: string): Promise<any> {
    const loginDetails = await this.authService.validateLogin(id, pass);
    if (loginDetails instanceof Error) {
      throw loginDetails;
    }
    if (!loginDetails) {
      throw new UnauthorizedException();
    }

    const user = this.userService.getUser(loginDetails.uuid);
    if (user instanceof Error) {
      throw user;
    }
    return user;
  }
}
