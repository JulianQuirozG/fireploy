import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class FilterUsuarioDto {
  @IsOptional()
  @IsString({ message: 'El sexo debe ser una cadena de texto' })
  @IsIn(['M', 'F', 'O'], {
    message: 'El sexo debe ser M (Masculino), F (Femenino) u O (Otro)',
  })
  readonly sexo?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsIn(['A', 'I'], { message: 'El estado debe ser A (Activo) o I (Inactivo)' })
  readonly estado?: string;

  @IsOptional()
  @IsString({ message: 'tipo debe ser una cadena de texto' })
  @MaxLength(13, { message: 'tipo debe tener maximo 13 carácteres' })
  @IsIn(['Administrador', 'Docente', 'Estudiante'], {
    message: `tipo debe ser (Docente) Docente, (Estudiante) Estudiante`,
  })
  readonly tipo?: string;
}
