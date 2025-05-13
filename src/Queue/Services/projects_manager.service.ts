/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ProjectManagerQueueService {
  constructor(
    @InjectQueue('project_manager') private readonly projectManagerQueue: Queue,
  ) {}

  async changeStatus(data: any) {
    const job = await this.projectManagerQueue.add('changeStatus', data);
    console.log('Trabajo enviado a la cola: system', data);
    await job.finished();
  }
}
