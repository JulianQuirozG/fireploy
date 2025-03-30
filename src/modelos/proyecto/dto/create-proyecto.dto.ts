import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsArray,
  IsUrl,
  IsNumber,
  MaxLength,
  IsIn,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { CreateBaseDeDatoDto } from 'src/modelos/base_de_datos/dto/create-base_de_dato.dto';
import { BaseDeDato } from 'src/modelos/base_de_datos/entities/base_de_dato.entity';

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
  @IsNumber()
  calificacion: number = 0;

  @IsOptional()
  url?: string = '';

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
  estado_proyecto: string = 'A';

  @IsNotEmpty({ message: 'El estado de ejecución es obligatorio' })
  @IsString({ message: 'El estado de ejecución debe ser una cadena de texto' })
  @MaxLength(1, {
    message: 'El estado del proyecto debe tener un solo carácter',
  })
  @IsIn(['F', 'N', 'E', 'L'], {
    message: 'estado debe ser Offline (F), Online (N), Error (E), Loading (L)',
  })
  estado_ejecucion: string = 'F';

  @IsOptional()
  @IsArray({ message: 'Los estudiantes deben ser una lista de IDs' })
  estudiantesIds?: number[];

  @IsNotEmpty({ message: 'La seccion es olbigatoria' })
  seccionId: number;

  tutorId?: number;

  @IsOptional()
  @ValidateNested({
    message: 'La base de datos no tiene una estructura válida',
  })
  @Type(() => CreateBaseDeDatoDto)
  @IsNotEmpty({ message: 'No se mando informacion de la base de datos' })
  base_de_datos?: BaseDeDato;

  @IsOptional()
  @IsDate()
  fecha_creacion: Date = new Date(Date.now());

  @IsNotEmpty({ message: 'El tipo de proyecto es obligatorio' })
  @IsString({ message: 'El tipo de proyecto debe ser una cadena de texto' })
  @MaxLength(1, {
    message: 'El tipo del proyecto debe tener un solo carácter',
  })
  @IsIn(['S', 'M'], {
    message:
      'Tipo de proyecto debe ser S (Fronted y backend separados) o M (Arquitecturas monoliticas)',
  })
  tipo_proyecto: string;
}
