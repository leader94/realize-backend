import * as AWS from 'aws-sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  private dynamoDb: AWS.DynamoDB;

  constructor() {
    this.dynamoDb = new AWS.DynamoDB({
      // Your config options
      accessKeyId: '',
      secretAccessKey: '',
      endpoint: '',
    });
  }
}
