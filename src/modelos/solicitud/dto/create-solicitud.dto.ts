import { IsDefined, IsNotEmpty } from 'class-validator';

export class CreateSolicitudDto {
  @IsDefined({ message: 'El usuario que pide la solicitud es obligatorio' })
  @IsNotEmpty({ message: 'El usuario que pide la solicitud no debe ser vacio' })
  readonly usuario: number;
}
