import {
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSolicitudDto {
  @IsDefined({ message: 'El usuario que pide la solicitud es obligatorio' })
  @IsNotEmpty({ message: 'El usuario que pide la solicitud no debe ser vacio' })
  readonly usuario: number;

  @IsDefined({ message: 'El tipo de solicitud es obligatorio' })
  @IsNotEmpty({ message: 'El tipo de solicitud no debe estar vacío' })
  @IsIn([1, 2], {
    message:
      'El tipo de solicitud debe ser 1 (Cambio de rol) o 2 (Solicitud de tutor)',
  })
  readonly tipo_solicitud: number;

  @IsOptional()
  @IsString({ message: 'El tipo de solicitud debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de solicitud no debe estar vacío' })
  readonly cursoId: string;
}
