import { Inject, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    private readonly config: ConfigService,
  ) {}

  async getPresignedUrl(key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.config.get('S3_BUCKET'),
      Key: key,
      ContentType: 'application/pdf',
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 900 });
    return url;
  }

  async delete(key: string) {
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.config.get('S3_BUCKET'),
      Key: key,
    }));
  }
}
