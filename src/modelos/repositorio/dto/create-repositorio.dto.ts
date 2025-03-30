import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  IsNumber,
  IsIn,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateRepositorioDto {
  @IsNotEmpty({ message: 'url es obligatorio' })
  @IsUrl()
  @Length(1, 256)
  url: string;

  @IsNotEmpty({ message: 'tipo es obligatorio' })
  @IsString()
  @Length(1, 1)
  @IsIn(['B', 'F', 'I'], {
    message: 'estado debe ser Backend (B), Frontend (F), Monolito (I)',
  })
  tipo: string;

  @IsNotEmpty({ message: 'tecnologia es obligatoria' })
  @IsString()
  @Length(1, 50)
  tecnologia: string;

  @IsNotEmpty({ message: 'version es obligatorio' })
  @IsString()
  @Length(1, 20)
  version: string;

  @IsNotEmpty({ message: 'El id del proyecto es obligatorio' }) // Puede ser opcional si se permite repos sin un proyecto asociado
  @IsNumber()
  proyecto_id: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Las variables de entorno no puede estar vacía' })
  @IsString({
    message: 'Las variables de entorno debe ser una cadena de texto',
  })
  @MaxLength(1024, {
    message: 'Las variables de entorno no puede tener más de 1024 caracteres',
  })
  readonly variables_de_entorno: string;
}
