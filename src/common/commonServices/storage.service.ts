import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import StorageConstants from '../constants/storage.constants';

type TgetSignedUploadPathOptions = {
  key: string;
  contentSize: number;
  expiry?: number;
};
@Injectable()
export class StorageService {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  private ipAdd = Object.values(require('os').networkInterfaces()).reduce(
    (r: any, list: any) =>
      r.concat(
        list.reduce(
          (rr, i) =>
            rr.concat((i.family === 'IPv4' && !i.internal && i.address) || []),
          []
        )
      ),
    []
  )[0];
  private client = new S3Client({
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'wYjbp98MDpjJ3HHY', // This specific key is required when working offline
      secretAccessKey: 'x1ABL0YwD98t3efs0z5BkGSjhixt3jQN',
    },
    endpoint: `http://${this.ipAdd}:9000`,
    region: 'us-west-2',
  });

  public async getSignedUploadPath(options: TgetSignedUploadPathOptions) {
    const { key, contentSize, expiry } = options;
    const contentLengthRangeCondition: [
      'content-length-range',
      number,
      number
    ] = ['content-length-range', contentSize - 50, contentSize + 50];

    const Conditions = [
      { acl: 'public-read' },
      { bucket: 'test' },
      // { 'Content-Type': 'audio/mp3' },   // todo try this
      contentLengthRangeCondition,
    ];

    const Bucket = 'test';
    const Key = key;
    const Fields = {
      acl: 'public-read',
    };

    try {
      const res = await createPresignedPost(this.client, {
        Bucket,
        Key,
        Conditions,
        Fields,
        Expires: expiry || StorageConstants.DEFAULT_UPLOAD_EXPIRY, //Seconds before the presigned post expires. 3600 by default.
      });

      return res;
    } catch (e) {
      throw e;
    }
  }

  public async putObject() {
    // const command = new PutObjectCommand(input);
    // const response = await client.send(command);
  }
  // async getBlob(
  //   key: string
  // ): Promise<PromiseResult<AWS.S3.GetObjectOutput, AWS.AWSError>> {
  //   const params = { Bucket: this.BUCKET, Key: key };
  //   const blob = await this.S3.getObject(params).promise();
  //   return blob;
  // }
  // async putBlob(
  //   blobName: string,
  //   blob: Buffer
  // ): Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>> {
  //   const params = { Bucket: this.BUCKET, Key: blobName, Body: blob };
  //   const uploadedBlob = await this.S3.putObject(params).promise();
  //   return uploadedBlob;
  // }
  // // to get stream you can use file.createReadStream()
  // async putStream(
  //   key: string,
  //   stream: ReadStream
  // ): Promise<AWS.S3.PutObjectOutput> {
  //   const file = await new Promise<AWS.S3.PutObjectOutput>(
  //     (resolve, reject) => {
  //       const handleError = (error) => {
  //         reject(error);
  //       };
  //       const chunks: Buffer[] = [];
  //       stream.on('data', (chunk: Buffer) => {
  //         chunks.push(chunk);
  //       });
  //       stream.once('end', async () => {
  //         const fileBuffer = Buffer.concat(chunks);
  //         try {
  //           const uploaded = await this.putBlob(key, fileBuffer);
  //           resolve(uploaded);
  //         } catch (error) {
  //           handleError(new InternalServerErrorException(error));
  //         }
  //       });
  //       stream.on('error', (error) =>
  //         handleError(new InternalServerErrorException(error))
  //       );
  //     }
  //   );
  //   return file;
  // }
}
