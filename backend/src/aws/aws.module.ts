import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import { StepFunctionsService } from './step-functions.service';
import { DynamoService } from './dynamo.service';
import { S3Client } from '@aws-sdk/client-s3';
import { SFNClient } from '@aws-sdk/client-sfn';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: (cfg: ConfigService) => {
        return new S3Client({
          region: cfg.get('AWS_REGION'),
          endpoint: cfg.get('S3_ENDPOINT'),
          forcePathStyle: true,
          credentials: {
            accessKeyId: cfg.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: cfg.get('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SFN_CLIENT',
      useFactory: (cfg: ConfigService) => {
        return new SFNClient({
          region: cfg.get('AWS_REGION'),
          endpoint: cfg.get('SFN_ENDPOINT'),
          credentials: {
            accessKeyId: cfg.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: cfg.get('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'DYNAMO_CLIENT',
      useFactory: (cfg: ConfigService) => {
        return new DynamoDBClient({
          region: cfg.get('AWS_REGION'),
          endpoint: cfg.get('DYNAMO_ENDPOINT'),
          credentials: {
            accessKeyId: cfg.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: cfg.get('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
    S3Service,
    StepFunctionsService,
    DynamoService,
  ],
  exports: [S3Service, StepFunctionsService, DynamoService],
})
export class AwsModule {}
