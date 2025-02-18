import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';
import { CreateEstudianteDto } from 'src/modelos/estudiante/dto/create-estudiante.dto';

export class CreateUsuarioDto extends CreateEstudianteDto {
  @IsDefined({ message: 'nombre es obligatorio' })
  @IsNotEmpty({ message: 'nombre no puede estar vacío' })
  @IsString({ message: 'nombre debe ser una cadena de texto' })
  @MaxLength(50, { message: 'nombre no puede tener más de 50 caracteres' })
  readonly nombre: string;

  @IsDefined({ message: 'apellido es obligatorio' })
  @IsNotEmpty({ message: 'apellido no puede estar vacío' })
  @IsString({ message: 'apellido debe ser una cadena de texto' })
  @MaxLength(50, { message: 'apellido no puede tener más de 50 caracteres' })
  readonly apellido: string;

  @IsDefined({ message: 'fecha_nacimiento es obligatoria' })
  @IsDateString({}, { message: 'fecha_nacimiento debe ser una fecha válida' })
  readonly fecha_nacimiento: Date;

  @IsDefined({ message: 'sexo es obligatorio' })
  @IsString({ message: 'sexo debe ser una cadena de texto' })
  @MaxLength(1, { message: 'sexo debe tener solo 1 carácter' })
  @IsIn(['M', 'F', 'O'], {
    message:
      'sexo debe ser "M" para Masculino, "F" para Femenino o "O" para Otro',
  })
  readonly sexo: string;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @MaxLength(512, {
    message: 'descripcion no puede tener más de 512 caracteres',
  })
  readonly descripcion: string;

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

  @IsDefined({ message: 'estado es obligatorio' })
  @IsString({ message: 'estado debe ser una cadena de texto' })
  @MaxLength(1, { message: 'estado debe tener solo 1 carácter' })
  @IsIn(['A', 'I'], {
    message: 'estado debe ser "A" para activo o "I" para inactivo',
  })
  readonly estado: string;

  @IsOptional()
  @IsString({ message: 'red_social debe ser una cadena de texto' })
  @MaxLength(256, {
    message: 'red_social no puede tener más de 256 caracteres',
  })
  readonly red_social: string;

  @IsOptional()
  @IsString({ message: 'foto_perfil debe ser una cadena de texto' })
  @MaxLength(256, {
    message: 'foto_perfil no puede tener más de 256 caracteres',
  })
  readonly foto_perfil: string;

  @IsDefined({ message: 'tipo es obligatorio' })
  @IsString({ message: 'tipo debe ser una cadena de texto' })
  @MaxLength(13, { message: 'tipo debe tener maximo 13 carácteres' })
  @IsIn(['Administrador', 'Docente', 'Estudiante'], {
    message: `tipo debe ser (Administrador) Admin, (Docente) Docente, (Estudiante) Estudiante`,
  })
  readonly tipo: string;
}
