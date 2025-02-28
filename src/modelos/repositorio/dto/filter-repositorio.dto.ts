import { IsString, IsUrl, Length, IsOptional } from 'class-validator';
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';

export class FilterRepositorioDto {
  Id?: number;

  @IsOptional()
  @IsUrl()
  @Length(1, 256)
  url?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1)
  tipo?: string;

  @IsOptional()
  @IsString()
  tecnologia?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional() // Puede ser opcional si se permite repos sin un proyecto asociado
  proyecto_id?: Proyecto;
}
