/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class deleteQueueService {
  constructor(@InjectQueue('delete') private readonly deleteQueue: Queue) {}

  /**
 * Adds a delete job to the delete queue and waits for its completion.
 *
 * @param data - The data payload associated with the delete operation.
 * @returns A promise that resolves when the job has been completed.
 */
  async enqueDelete(data: any) {
    const job = await this.deleteQueue.add('delete', data);
    return await job.finished();
  }
}
