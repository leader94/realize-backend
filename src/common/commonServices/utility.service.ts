import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UtilityService {
  public getNewUUID(): string {
    return uuid();
  }

  public getNewSceneId(): string {
    return `sc_${this.getNewUUID()}`;
  }
  public getNewProjectId(): string {
    return `pr_${this.getNewUUID()}`;
  }

  public queryParamToBool(value: string) {
    return (value + '').toLowerCase() === 'true';
  }
}
