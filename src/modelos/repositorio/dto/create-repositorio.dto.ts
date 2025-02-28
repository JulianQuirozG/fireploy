import { IsNotEmpty, IsString, IsUrl, Length, IsNumber } from 'class-validator';

export class CreateRepositorioDto {
  @IsNotEmpty({ message: 'url es obligatorio' })
  @IsUrl()
  @Length(1, 256)
  url: string;

  @IsNotEmpty({ message: 'tipo es obligatorio' })
  @IsString()
  @Length(1, 1)
  tipo: string;

  @IsNotEmpty({ message: 'tecnologia es obligatoria' })
  @IsString()
  @Length(1, 50)
  tecnologia: string;

  @IsNotEmpty({ message: 'version es obligatorio' })
  @IsString()
  @Length(1, 20)
  version: string;

  @IsNotEmpty({ message: 'El id del proyecto es obligatorio' }) // Puede ser opcional si se permite repos sin un proyecto asociado
  @IsNumber()
  proyecto_id: number;
}
