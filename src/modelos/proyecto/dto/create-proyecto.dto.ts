import {
  IsNotEmpty,
  IsString,
  Length,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  IsUrl,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreateProyectoDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El título debe tener entre 1 y 50 caracteres' })
  titulo: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(0, 512, {
    message: 'La descripción no puede exceder los 512 caracteres',
  })
  descripcion?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La calificación debe ser un número' })
  calificacion?: number;

  @IsOptional()
  @IsUrl({}, { message: 'La URL debe ser una dirección válida' })
  @Length(1, 256, { message: 'La URL debe tener máximo 256 caracteres' })
  url?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @Length(1, 256, {
    message: 'La URL de la imagen debe tener máximo 256 caracteres',
  })
  imagen?: string;

  @IsNotEmpty({ message: 'El estado del proyecto es obligatorio' })
  @IsString({ message: 'El estado del proyecto debe ser una cadena de texto' })
  @MaxLength(1, {
    message: 'El estado del proyecto debe tener un solo carácter',
  })
  @IsIn(['A', 'I'], {
    message: 'estado debe ser "A" para activo o "I" para inactivo',
  })
  estado_proyecto: string;

  @IsNotEmpty({ message: 'El estado de ejecución es obligatorio' })
  @IsString({ message: 'El estado de ejecución debe ser una cadena de texto' })
  @MaxLength(1, {
    message: 'El estado del proyecto debe tener un solo carácter',
  })
  @IsIn(['F', 'N', 'E', 'L'], {
    message: 'estado debe ser Offline (F), Online (N), Error (E), Loading (L)',
  })
  estado_ejecucion: string;

  @IsOptional()
  @IsArray({ message: 'Los estudiantes deben ser una lista de IDs' })
  estudiantesIds?: number[];

  @IsOptional()
  seccionId?: number;

  @IsOptional()
  tutorId?: number;

  @IsOptional()
  @IsArray({ message: 'Los repositorios deben ser una lista de IDs' })
  repositoriosIds?: number[];

  @IsOptional()
  baseDeDatosId?: number;

  @IsNotEmpty({ message: 'La fecha de creación es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de creación debe estar en formato ISO (YYYY-MM-DD)' },
  )
  fecha_creacion: Date;
}
