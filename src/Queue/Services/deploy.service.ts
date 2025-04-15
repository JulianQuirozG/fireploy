import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DeployQueueService {
  constructor(@InjectQueue('deploy') private readonly deployQueue: Queue) {}

  async enqueDeploy(type: string, data: any) {
    await this.deployQueue.add(type, data);
    console.log('Trabajo enviado a la cola: deploy ', data);
  }
}
