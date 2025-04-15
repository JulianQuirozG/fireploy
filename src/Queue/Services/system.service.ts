import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SystemQueueService {
  constructor(@InjectQueue('system') private readonly systemQueue: Queue) {}

  async enqueSystem(type: string, data: any) {
    await this.systemQueue.add(type, data);
    console.log('Trabajo enviado a la cola: system', data);
  }
}
