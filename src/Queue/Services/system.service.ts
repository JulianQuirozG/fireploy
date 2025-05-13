/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SystemQueueService {
  constructor(@InjectQueue('data_base') private readonly systemQueue: Queue) {}

  /**
 * Adds a job to the system queue to trigger the creation of a database.
 *
 * @param {any} data - The data required for database creation (e.g., client info, DB config).
 * @returns {Promise<void>} - Resolves when the job has been completed successfully.
 */
  async enqueSystem(data: any) {
    const job = await this.systemQueue.add('create_DB', data);
    console.log('Trabajo enviado a la cola: system', data);
    const response = await job.finished();
    return response.connection_URI as string;
  }
}
