import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeployQueueService } from './Services/deploy.service';
import { CreateDeployDto } from './dto/create-deploy.dto';
import { UpdateDeployDto } from './dto/update-deploy.dto';
import { Public } from 'src/decorators/public.decorator';
import { SystemQueueService } from './Services/system.service';

@Controller('deploy')
export class DeployController {
  constructor(
    private deployService: DeployQueueService,
    private SystemService: SystemQueueService,
  ) { }

  @Post('/encolarProyecto')
  @Public()
  enqueueDeploy(@Body() body: any) {
    return this.deployService.enqueDeploy(body);
  }

  @Post('/encolarSystem')
  @Public()
  enqueueSystem(@Body() body: any) {
    return this.SystemService.enqueSystem(body);
  }
}
