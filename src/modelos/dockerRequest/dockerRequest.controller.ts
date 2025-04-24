import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DockerRequestService } from './dockerRequest.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('dockerRequest')
export class DockerRequestController {
  constructor(private readonly dockerQueryService: DockerRequestService) {}

  @Public()
  @Get('repositories/:query')
  findRepositories(@Param('query') query: string) {
    return this.dockerQueryService.findRepositories(query);
  }

  @Public()
  @Get('tags/:repository')
  findTags(@Param('repository') repository: string) {
    return this.dockerQueryService.findTags(repository);
  }
}
