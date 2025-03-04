import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateSeccionDto {
  @IsDefined({ message: 'El título es obligatorio' })
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El título no puede tener más de 50 caracteres' })
  readonly titulo: string;

  @IsDefined({ message: 'La descripción es obligatoria' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(512, {
    message: 'La descripción no puede tener más de 512 caracteres',
  })
  readonly descripcion: string;

  @IsDefined({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  readonly fecha_inicio: Date;

  @IsDefined({ message: 'La fecha de fin es obligatoria' })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  readonly fecha_fin: Date;

  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @MaxLength(1, { message: 'El estado debe tener solo 1 carácter' })
  @IsIn(['A', 'I'], {
    message: 'El estado debe ser "A" para activo o "I" para inactivo',
  })
  readonly estado: string = 'A';

  @IsDefined({ message: 'El cursoId es obligatorio' })
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  readonly cursoId: string;
}
