import { Module } from '@nestjs/common';
import { DeployService } from './deploy.service';
import { DeployController } from './deploy.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost', // o IP del contenedor si estás fuera de docker
        port: 6380,
      },
    }),
    BullModule.registerQueue({
      name: 'deploy',
    }),
  ],
  controllers: [DeployController],
  providers: [DeployService],
})
export class DeployModule { }
