import { IsIn, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterSolicitudDto {
  @IsOptional()
  @IsIn(['P', 'A', 'R'], {
    message: 'El estado debe ser P (Pendiente), A (Aprobado) o R (Rechazado)',
  })
  estado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El usuario debe ser un número válido' })
  usuario?: number;

  @IsOptional()
  @IsIn([1, 2], {
    message:
      'El tipo de solicitud debe ser 1 (Cambio de rol) o 2 (Solicitud de tutor)',
  })
  tipo_solicitud?: number;

  @IsOptional()
  curso?: string;
}
