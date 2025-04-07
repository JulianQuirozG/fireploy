import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  IsNumber,
  IsIn,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { VariablesDeEntornoDto } from './variables_de_entorno.dto';

export class CreateRepositorioDto {
  @IsOptional()
  @IsNotEmpty({ message: 'url es obligatorio' })
  @IsUrl()
  @Length(1, 256)
  url?: string;

  @IsNotEmpty({ message: 'tipo es obligatorio' })
  @IsString()
  @Length(1, 1)
  @IsIn(['B', 'F', 'I'], {
    message: 'estado debe ser Backend (B), Frontend (F), Monolito (I)',
  })
  tipo: string;

  @IsOptional()
  @IsNotEmpty({ message: 'tecnologia es obligatoria' })
  @IsString()
  @Length(1, 50)
  tecnologia?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'version es obligatorio' })
  @IsString()
  @Length(1, 20)
  version?: string;

  @IsNotEmpty({ message: 'El id del proyecto es obligatorio' })
  @IsNumber()
  proyecto_id: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Las variables de entorno no puede estar vacía' })
  @ValidateNested({
    message: 'Las variables de entorno no tiene una estructura válida',
  })
  @Type(() => VariablesDeEntornoDto)
  readonly variables_de_entorno?: VariablesDeEntornoDto[];
}
