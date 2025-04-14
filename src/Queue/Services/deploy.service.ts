import { Injectable } from '@nestjs/common';
import { CreateDeployDto } from '../dto/create-deploy.dto';
import { UpdateDeployDto } from '../dto/update-deploy.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DeployQueueService {
  constructor(@InjectQueue('deploy') private readonly deployQueue: Queue) { }

  async enqueDeploy(data: any) {
    await this.deployQueue.add('desplegar',data);
    console.log('Trabajo enviado a la cola: deploy ', data);
  }

}
