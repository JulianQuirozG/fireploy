import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { Docente } from 'src/modelos/docente/entities/docente.entity';
import { Materia } from 'src/modelos/materia/entities/materia.entity';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';

export class FilterCursoDto {
  @IsOptional()
  id?: string;

  @IsOptional()
  @IsString({ message: 'grupo debe ser una cadena de texto' })
  @Length(1, 1, { message: 'grupo debe tener exactamente 1 carácter' })
  grupo?: string;

  @IsOptional()
  @IsString({ message: 'semestre debe ser una cadena de texto' })
  @Length(1, 50, { message: 'semestre debe tener entre 1 y 50 caracteres' })
  semestre?: string;

  @IsOptional()
  @IsString({ message: 'estado debe ser una cadena de texto' })
  @MaxLength(1, { message: 'estado debe tener solo 1 carácter' })
  @IsIn(['A', 'I'], {
    message: 'estado debe ser "A" para activo o "I" para inactivo',
  })
  estado?: string;

  @IsOptional()
  docente?: Docente;

  @IsOptional()
  materia?: Materia;

  @IsOptional({ message: `Debes enviar al menos un id de estudiante` })
  estudiantes?: Usuario;
}
