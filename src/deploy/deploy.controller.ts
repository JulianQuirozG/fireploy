import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeployService } from './deploy.service';
import { CreateDeployDto } from './dto/create-deploy.dto';
import { UpdateDeployDto } from './dto/update-deploy.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('deploy')
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  @Post('/encolar')
  @Public()
  enqueue(@Body() body: any ){
    return this.deployService.enqueDeploy(body);
  }

  @Post()
  create(@Body() createDeployDto: CreateDeployDto) {
    return this.deployService.create(createDeployDto);
  }

  @Get()
  findAll() {
    return this.deployService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deployService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeployDto: UpdateDeployDto) {
    return this.deployService.update(+id, updateDeployDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deployService.remove(+id);
  }
}
