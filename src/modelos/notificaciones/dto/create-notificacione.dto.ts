import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsNumber,
  IsIn,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';

export class CreateNotificacioneDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El título debe tener entre 1 y 50 caracteres' })
  titulo: string;

  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Length(1, 255, { message: 'El título debe tener entre 1 y 50 caracteres' })
  mensaje: string;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2], {
    message: 'Tipo de notificaciones (1) proyectos, (2) solcitudes',
  })
  tipo: number;

  @IsDate()
  fecha_creacion: Date = new Date(Date.now());

  @IsBoolean()
  visto: boolean = true;

  @IsNotEmpty({ message: 'No se mando informacion de la base de datos' })
  usuario: Usuario;
}
