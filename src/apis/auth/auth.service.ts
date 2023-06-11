import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateLogin(username: string, pass: string): Promise<any> {
    const loginDetails = await this.usersService.findLoginDetails(
      username,
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
}
