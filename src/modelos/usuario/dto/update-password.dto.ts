import {
  IsDefined,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateEstudianteDto } from 'src/modelos/estudiante/dto/create-estudiante.dto';

export class UpdatePasswordDto extends CreateEstudianteDto {
  @IsDefined({ message: 'correo es obligatorio' })
  @IsEmail({}, { message: 'correo electrónico no es válido' })
  @MaxLength(50, { message: 'correo no puede tener más de 50 caracteres' })
  readonly correo: string;

  @IsDefined({ message: 'contrasenia es obligatoria' })
  @MinLength(6, { message: 'contrasenia debe tener al menos 6 caracteres' })
  @MaxLength(512, {
    message: 'contrasenia no puede tener más de 512 caracteres',
  })
  contrasenia: string;

  @IsDefined({ message: 'nueva contrasenia es obligatoria' })
  @MinLength(6, { message: 'nueva contrasenia debe tener al menos 6 caracteres' })
  @MaxLength(512, {
    message: 'nueva contrasenia no puede tener más de 512 caracteres',
  })
  nuevaContrasenia: string;

  
}
