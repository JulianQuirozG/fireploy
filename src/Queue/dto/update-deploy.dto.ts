import { PartialType } from '@nestjs/mapped-types';
import { CreateDeployDto } from './create-deploy.dto';

export class UpdateDeployDto extends PartialType(CreateDeployDto) {}
