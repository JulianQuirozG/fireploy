import { IsDateString, IsOptional } from 'class-validator';

export class FilterEstudianteDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  est_fecha_inicio?: Date;
}
