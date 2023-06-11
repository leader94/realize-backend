import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // TODO merge user roles with validate
  async validate(payload: any) {
    // best place to populate user object based on userid from payload
    try {
      const user = await this.userService.getUser(payload.username, true);
      return user;
    } catch (e) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    // return { userId: payload.sub, username: payload.username };
  }
}
