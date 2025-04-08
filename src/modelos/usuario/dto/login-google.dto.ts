import {
  IsDefined,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginGoogleDto {
  @IsDefined({ message: 'token es obligatorio' })
  @IsEmail({}, { message: 'token electrónico no es válido' })
  @MaxLength(50, { message: 'token no puede tener más de 50 caracteres' })
  readonly token: string;
}
