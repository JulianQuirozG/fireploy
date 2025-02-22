import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateCursoDto {
  id?: string;

  @IsNotEmpty({ message: 'grupo es obligatorio' })
  @IsString({ message: 'grupo debe ser una cadena de texto' })
  @Length(1, 1, { message: 'grupo debe tener exactamente 1 carácter' })
  grupo: string;

  @IsNotEmpty({ message: 'semestre es obligatorio' })
  @IsString({ message: 'semestre debe ser una cadena de texto' })
  @Length(1, 50, { message: 'semestre debe tener entre 1 y 50 caracteres' })
  semestre: string;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @Length(0, 512, {
    message: 'descripcion no puede tener más de 512 caracteres',
  })
  descripcion?: string;

  @IsNotEmpty({ message: 'estado es obligatorio' })
  @IsString({ message: 'estado debe ser una cadena de texto' })
  @MaxLength(1, { message: 'estado debe tener solo 1 carácter' })
  @IsIn(['A', 'I'], {
    message: 'estado debe ser "A" para activo o "I" para inactivo',
  })
  estado: string;

  @IsOptional()
  docenteId?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'materia es obligatoria' })
  materiaId: number;
}
