/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class deleteQueueService {
  constructor(@InjectQueue('delete') private readonly deleteQueue: Queue) {}

  async enqueDelete(data: any) {
    console.log(data);
    const job = await this.deleteQueue.add('delete', data);
    console.log('Trabajo enviado a la cola: system', data);
    return await job.finished();
  }
}
