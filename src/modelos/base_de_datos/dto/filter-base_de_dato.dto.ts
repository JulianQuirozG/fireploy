import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class FilterBaseDeDatoDto {
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El nombre no puede tener más de 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'El tipo no puede estar vacío' })
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  @IsIn(['S', 'N'], {
    message: 'El tipo debe ser "S" para SQL o "N" para NoSQL',
  })
  tipo?: string;
}
