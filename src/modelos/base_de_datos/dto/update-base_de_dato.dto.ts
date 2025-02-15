import { PartialType } from '@nestjs/mapped-types';
import { CreateBaseDeDatoDto } from './create-base_de_dato.dto';

export class UpdateBaseDeDatoDto extends PartialType(CreateBaseDeDatoDto) {}
