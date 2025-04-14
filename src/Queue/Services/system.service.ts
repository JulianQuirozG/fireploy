import { Injectable } from '@nestjs/common';
import { CreateDeployDto } from '../dto/create-deploy.dto';
import { UpdateDeployDto } from '../dto/update-deploy.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SystemQueueService {
  constructor(@InjectQueue('system') private readonly systemQueue: Queue) {}

  async enqueSystem(data: any) {
    await this.systemQueue.add('deploy-system', data);
    console.log('Trabajo enviado a la cola: system', data);
  }

}
