import {
  IsDefined,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EmailUpdatePasswordDto {
  @IsDefined({ message: 'correo es obligatorio' })
  @IsEmail({}, { message: 'correo electrónico no es válido' })
  @MaxLength(50, { message: 'correo no puede tener más de 50 caracteres' })
  readonly correo: string;
}
