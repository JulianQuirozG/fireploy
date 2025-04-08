import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class VariablesDeEntornoDto {
  @IsDefined({ message: 'clave es obligatorio' })
  @IsNotEmpty({ message: 'clave no puede estar vacío' })
  @IsString({ message: 'clave debe ser una cadena de texto' })
  clave: string;

  @IsDefined({ message: 'valor es obligatorio' })
  @IsNotEmpty({ message: 'valor no puede estar vacío' })
  @IsString({ message: 'valor debe ser una cadena de texto' })
  valor: string;
}
