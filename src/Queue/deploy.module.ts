import { Module } from '@nestjs/common';
import { DeployQueueService } from './Services/deploy.service';
import { DeployController } from './deploy.controller';
import { BullModule } from '@nestjs/bull';
import { SystemQueueService } from './Services/system.service';
import { ProjectManagerQueueService } from './Services/projects_manager.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST, // o IP del contenedor si estás fuera de docker
        port: Number(process.env.REDIS_PORT ?? 6380),
      },
    }),
    BullModule.registerQueue(
      { name: 'deploy' },
      { name: 'data_base' },
      { name: 'project_manager' },
    ),
  ],
  controllers: [DeployController],
  providers: [
    DeployQueueService,
    SystemQueueService,
    ProjectManagerQueueService,
  ],
  exports: [DeployQueueService, SystemQueueService, ProjectManagerQueueService],
})
export class DeployModule {}
