/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DeployQueueService {
  constructor(@InjectQueue('deploy') private readonly deployQueue: Queue) {}

  /**
   * Adds a new deployment job to the queue and waits for its completion.
   *
   * @param {any} data - The data associated with the deployment job.
   * @returns {Promise<void>} - Resolves when the job has been completed.
   */
  async enqueDeploy(data: any) {
    const job = await this.deployQueue.add('deploy', data);
    console.log('Trabajo enviado a la cola: system', data);
    await job.finished();
  }

  /**
   * Retrieves all jobs currently waiting in the deployment queue.
   *
   * @returns {Promise<Array<{ id: string | number; name: string; data: any; position: number }>>}
   * An array of objects representing the waiting jobs with their ID, name, data, and position in the queue.
   */
  async getWaitingJobs() {
    const jobs = await this.deployQueue.getWaiting();
    const result = jobs.map((job, index) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      position: index + 1,
    }));
    return result;
  }
}
