import { PartialType } from '@nestjs/mapped-types';
import { CreateProyectoDto } from './create-proyecto.dto';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsIn,
  MaxLength,
  IsArray,
  Length,
  IsDate,
} from 'class-validator';

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El título debe tener entre 1 y 50 caracteres' })
  titulo?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(0, 512, {
    message: 'La descripción no puede exceder los 512 caracteres',
  })
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  calificacion?: number;

  @IsOptional()
  @IsString({ message: 'El estado del proyecto debe ser una cadena de texto' })
  @MaxLength(1, {
    message: 'El estado del proyecto debe tener un solo carácter',
  })
  @IsIn(['A', 'I'], {
    message: 'estado debe ser "A" para activo o "I" para inactivo',
  })
  estado_proyecto?: string;

  @IsOptional()
  @IsArray({ message: 'Los estudiantes deben ser una lista de IDs' })
  estudiantesIds?: number[];

  @IsOptional()
  @IsString({ message: 'El tipo de proyecto debe ser una cadena de texto' })
  @MaxLength(1, {
    message: 'El tipo del proyecto debe tener un solo carácter',
  })
  @IsIn(['S', 'M'], {
    message:
      'Tipo de proyecto debe ser S (Fronted y backend separados) o M (Arquitecturas monoliticas)',
  })
  tipo_proyecto?: string;

  @IsOptional()
  @IsString({ message: 'El estado de ejecución debe ser una cadena de texto' })
  @MaxLength(1, {
    message: 'El estado del proyecto debe tener un solo carácter',
  })
  @IsIn(['F', 'N', 'E', 'L'], {
    message: 'estado debe ser Offline (F), Online (N), Error (E), Loading (L)',
  })
  estado_ejecucion?: string;

  @IsOptional()
  @IsDate()
  fecha_creacion?: Date;
}
