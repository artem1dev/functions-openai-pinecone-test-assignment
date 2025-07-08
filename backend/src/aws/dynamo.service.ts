import { Inject, Injectable } from '@nestjs/common';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamoService {
  constructor(
    @Inject('DYNAMO_CLIENT') private readonly db: DynamoDBClient,
    private readonly config: ConfigService,
  ) {}

  async updateStatus(table: string, key: Record<string, any>, status: string) {
    await this.db.send(new UpdateItemCommand({
      TableName: table,
      Key: key,
      UpdateExpression: 'SET #st = :s',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: { ':s': { S: status } },
    }));
  }
}
