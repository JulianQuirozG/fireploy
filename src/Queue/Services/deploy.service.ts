/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DeployQueueService {
  constructor(@InjectQueue('deploy') private readonly deployQueue: Queue) {}

  async enqueDeploy(data: any) {
    const job = await this.deployQueue.add('deploy', data);
    console.log('Trabajo enviado a la cola: system', data);
    await job.finished();
  }

  async getWaitingJobs() {
    const jobs = await this.deployQueue.getWaiting();
    console.log(jobs);
    const result = jobs.map((job, index) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      position: index + 1,
    }));

    return result;
  }
}
