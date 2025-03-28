import { IsIn, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';

export class FilterSolicitudDto {
  @IsOptional()
  @IsIn(['P', 'A', 'R'], {
    message: 'El estado debe ser P (Pendiente), A (Aprobado) o R (Rechazado)',
  })
  estado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El usuario debe ser un número válido' })
  usuario?: Number;
}
