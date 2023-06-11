import { Injectable } from '@nestjs/common';

@Injectable()
export class ErrorService {
  public BadRequest() {
    throw new Error('Bad Request');
  }
}
