import { IsIn, IsOptional, IsNumber, IsDefined, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSolicitudDto {
  @IsNotEmpty({ message: 'El tipo de solicitud no debe estar vacío' })
  @IsDefined({ message: 'El id del usuario es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El usuario debe ser un número válido' })
  id: number;

  @IsNotEmpty({ message: 'El tipo de solicitud no debe estar vacío' })
  @IsDefined({ message: 'El tipo de solicitud es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El usuario debe ser un número válido' })
  tipo: number;

}
