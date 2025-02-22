import { IsOptional, IsString, IsIn } from 'class-validator';
import { Curso } from 'src/modelos/curso/entities/curso.entity';

export class FilterSeccionDto {
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsIn(['A', 'I'], { message: 'El estado debe ser A (Activo) o I (Inactivo)' })
  readonly estado?: string;

  @IsOptional()
  @IsString({ message: 'curso debe ser una cadena de texto' })
  curso?: Curso;
}
