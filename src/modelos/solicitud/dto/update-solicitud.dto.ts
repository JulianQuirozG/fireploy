import { IsDefined, IsIn, IsNotEmpty } from 'class-validator';

export class UpdateSolicitudDto {
  @IsDefined({ message: 'Se debe mandar el estado de la solicitud' })
  @IsNotEmpty({ message: 'El estado no puede estar vacío' })
  @IsIn(['P', 'A', 'R'], {
    message: 'El estado debe ser P (Pendiente), A (Aprobado) o R (Rechazado)',
  })
  estado: string;

  @IsDefined({ message: 'Se debe mandar el usuario que responde la solicitud' })
  @IsNotEmpty({
    message: 'El usuario que responde la solicitud no puede estar vacío',
  })
  aprobado_by: number;
}
