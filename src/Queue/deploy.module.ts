import { Module } from '@nestjs/common';
import { DeployQueueService } from './Services/deploy.service';
import { DeployController } from './deploy.controller';
import { BullModule } from '@nestjs/bull';
import { SystemQueueService } from './Services/system.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost', // o IP del contenedor si estás fuera de docker
        port: 6380,
      },
    }),
    BullModule.registerQueue(
      { name: 'deploy' },
      { name: 'system' },
    ),
  ],
  controllers: [DeployController],
  providers: [DeployQueueService, SystemQueueService],
  exports: [DeployQueueService, SystemQueueService],
})
export class DeployModule { }
