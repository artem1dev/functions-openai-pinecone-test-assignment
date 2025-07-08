import { Inject, Injectable } from '@nestjs/common';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StepFunctionsService {
  constructor(
    @Inject('SFN_CLIENT') private readonly sfn: SFNClient,
    private readonly config: ConfigService,
  ) {}

  async startWorkflow(fileId: string, s3Key: string) {
    const stateMachineArn = this.config.get('SFN_ARN');
    const input = JSON.stringify({ fileId, s3Key });
    await this.sfn.send(new StartExecutionCommand({ stateMachineArn, input }));
  }
}
