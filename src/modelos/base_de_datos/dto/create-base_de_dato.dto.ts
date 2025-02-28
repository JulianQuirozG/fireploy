import { IsDefined, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateBaseDeDatoDto {
  @IsDefined({ message: 'El usuario es obligatorio' })
  @IsNotEmpty({ message: 'El usuario no puede estar vacío' })
  @IsString({ message: 'El usuario debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El usuario no puede tener más de 50 caracteres' })
  usuario: string;

  @IsDefined({ message: 'La contraseña es obligatoria' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Length(1, 512, {
    message: 'La contraseña no puede tener más de 512 caracteres',
  })
  contrasenia: string;

  @IsDefined({ message: 'La URL es obligatoria' })
  @IsNotEmpty({ message: 'La URL no puede estar vacía' })
  @IsString({ message: 'La URL debe ser una cadena de texto' })
  @Length(1, 512, { message: 'La URL no puede tener más de 512 caracteres' })
  url: string;

  @IsDefined({ message: 'El tipo es obligatorio' })
  @IsNotEmpty({ message: 'El tipo no puede estar vacío' })
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  @IsIn(['S', 'N'], {
    message: 'El tipo debe ser "S" para SQL o "N" para NoSQL',
  })
  tipo: string;
}
