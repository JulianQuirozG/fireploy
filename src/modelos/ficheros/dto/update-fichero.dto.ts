import { PartialType } from '@nestjs/mapped-types';
import { CreateFicheroDto } from './create-fichero.dto';

export class UpdateFicheroDto extends PartialType(CreateFicheroDto) {}
