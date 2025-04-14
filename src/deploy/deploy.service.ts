import { Injectable } from '@nestjs/common';
import { CreateDeployDto } from './dto/create-deploy.dto';
import { UpdateDeployDto } from './dto/update-deploy.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DeployService {
  constructor(@InjectQueue('deploy') private readonly deployQueue: Queue) {}

  async enqueDeploy(data: any) {
    await this.deployQueue.add('desplegar', data);
    console.log('Trabajo enviado a la cola:', data);
  }

  create(createDeployDto: CreateDeployDto) {
    return 'This action adds a new deploy';
  }

  findAll() {
    return `This action returns all deploy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deploy`;
  }

  update(id: number, updateDeployDto: UpdateDeployDto) {
    return `This action updates a #${id} deploy`;
  }

  remove(id: number) {
    return `This action removes a #${id} deploy`;
  }
}
