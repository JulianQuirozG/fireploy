import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { Docente } from 'src/modelos/docente/entities/docente.entity';

export class UpdateCursoDto {
  id: string;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @Length(0, 512, {
    message: 'descripcion no puede tener más de 512 caracteres',
  })
  descripcion?: string;

  @IsOptional()
  @IsString({ message: 'estado debe ser una cadena de texto' })
  @Length(1, 1, { message: 'estado debe tener solo 1 carácter' })
  @IsIn(['A', 'I'], {
    message: 'estado debe ser "A" para activo o "I" para inactivo',
  })
  estado?: string;

  @IsOptional()
  docente?: Docente;
}
