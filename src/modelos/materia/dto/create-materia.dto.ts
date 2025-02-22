import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreateMateriaDto {
  @IsDefined({ message: 'nombre es obligatorio' })
  @IsNotEmpty({ message: 'nombre no puede estar vacío' })
  @IsString({ message: 'nombre debe ser una cadena de texto' })
  @MaxLength(50, { message: 'nombre no puede tener más de 50 caracteres' })
  readonly nombre: string;

  @IsDefined({ message: 'semestre es obligatorio' })
  @IsNotEmpty({ message: 'semestre no puede estar vacío' })
  @IsString({ message: 'semestre debe ser una cadena de texto' })
  @MaxLength(5, { message: 'semestre no puede tener más de 5 caracteres' })
  readonly semestre: string;

  @IsNotEmpty({ message: 'estado no puede estar vacío' })
  @IsString({ message: 'estado debe ser una cadena de texto' })
  @MaxLength(1, { message: 'estado debe tener solo 1 carácter' })
  @IsIn(['A', 'I'], {
    message: 'estado debe ser "A" para activo o "I" para inactivo',
  })
  readonly estado: string = 'A';
}
