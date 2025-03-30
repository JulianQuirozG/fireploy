import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

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
  @IsString({
    message: 'Las variables de entorno debe ser una cadena de texto',
  })
  @MaxLength(1024, {
    message: 'Las variables de entorno no puede tener más de 1024 caracteres',
  })
  readonly variables_de_entorno: string;
}
