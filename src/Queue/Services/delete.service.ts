/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class deleteQueueService {
  constructor(@InjectQueue('delete') private readonly deleteQueue: Queue) {}

  async enqueDelete(data: any) {
    const job = await this.deleteQueue.add('delete', data);
    return await job.finished();
  }
}
