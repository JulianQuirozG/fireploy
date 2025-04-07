import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { VariablesDeEntorno } from 'src/interfaces/variables_entorno.interface';
import { CreateBaseDeDatoPartialDto } from 'src/modelos/base_de_datos/dto/create-base_de_dato_partial.dto';
import { VariablesDeEntornoDto } from './variables_de_entorno.dto';

export class UpdateRepositorioDto {
  id?: number;
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  tecnologia?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Las variables de entorno no puede estar vacía' })
  @ValidateNested({
    message: 'Las variables de entorno no tiene una estructura válida',
  })
  @Type(() => VariablesDeEntornoDto)
  readonly variables_de_entorno?: VariablesDeEntorno[];
}
