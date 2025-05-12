/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SystemQueueService {
  constructor(@InjectQueue('data_base') private readonly systemQueue: Queue) {}

  async enqueSystem(data: any) {
    const job = await this.systemQueue.add('create_DB', data);
    console.log('Trabajo enviado a la cola: system', data);
    await job.finished();
  }
}
