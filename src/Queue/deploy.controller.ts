import { Controller, Post, Body } from '@nestjs/common';
import { DeployQueueService } from './Services/deploy.service';
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
    return this.deployService.enqueDeploy('desplegar', body);
  }

  @Post('/encolarSystem')
  @Public()
  enqueueSystem(@Body() body: any) {
    return this.SystemService.enqueSystem('deploy-system', body);
  }
}
