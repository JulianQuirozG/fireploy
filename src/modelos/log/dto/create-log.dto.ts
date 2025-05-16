import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLogDto {
  @IsNotEmpty({ message: 'fecha_registro es obligatorio' })
  @IsDateString({}, { message: 'fecha_nacimiento debe ser una fecha válida' })
  fecha_registro: Date;

  @IsNotEmpty({ message: 'log es obligatorio' })
  @IsString({ message: 'log debe ser una cadena de texto' })
  @MaxLength(2048, { message: 'log debe tener máximo 2048 caracteres' })
  log: string;

  @IsNotEmpty({ message: 'repositorioId es obligatorio' })
  @IsNumber()
  repositorioId: number;
}
