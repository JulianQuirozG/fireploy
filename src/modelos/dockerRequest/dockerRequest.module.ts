import { forwardRef, Module } from '@nestjs/common';
import { DockerRequestController } from './dockerRequest.controller';
import { DockerRequestService } from './dockerRequest.service';

@Module({

  controllers: [DockerRequestController],
  providers: [DockerRequestService],
  exports: [DockerRequestService],
})
export class DockerRequestModule {}
