import {
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  IsIn,
} from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  readonly nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El apellido no puede tener más de 50 caracteres' })
  readonly apellido?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe ser una fecha válida' },
  )
  readonly fecha_nacimiento?: Date;

  @IsOptional()
  @IsString({ message: 'El sexo debe ser una cadena de texto' })
  @MaxLength(1, { message: 'El sexo debe tener solo 1 carácter' })
  @IsIn(['M', 'F', 'O'], {
    message:
      'sexo debe ser "M" para Masculino, "F" para Femenino o "O" para Otro',
  })
  readonly sexo?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(512, {
    message: 'La descripción no puede tener más de 512 caracteres',
  })
  readonly descripcion?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @MaxLength(1, { message: 'El estado debe tener solo 1 carácter' })
  @IsIn(['A', 'I'], {
    message: 'estado debe ser "A" para activo o "I" para inactivo',
  })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'La red social debe ser una cadena de texto' })
  @MaxLength(256, {
    message: 'La red social no puede tener más de 256 caracteres',
  })
  readonly red_social?: string;

  @IsOptional()
  @IsString({ message: 'La foto de perfil debe ser una cadena de texto' })
  @MaxLength(256, {
    message: 'La foto de perfil no puede tener más de 256 caracteres',
  })
  readonly foto_perfil?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  est_fecha_inicio?: Date;

  @IsOptional()
  @IsString({ message: 'tipo debe ser una cadena de texto' })
  @MaxLength(13, { message: 'tipo debe tener maximo 13 carácteres' })
  @IsIn(['Administrador', 'Docente', 'Estudiante'], {
    message: `tipo debe ser (Docente) Docente, (Estudiante) Estudiante`,
  })
  readonly tipo: string;
}
