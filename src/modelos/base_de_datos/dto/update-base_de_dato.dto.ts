import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateBaseDeDatoDto {

  @IsOptional()
  @IsNotEmpty({ message: 'La URL no puede estar vacía ' })
  @IsString({ message: 'La URL debe ser una cadena de texto' })
  @Length(1, 512, { message: 'La URL no puede tener más de 512 caracteres' })
  url?: string;
}
