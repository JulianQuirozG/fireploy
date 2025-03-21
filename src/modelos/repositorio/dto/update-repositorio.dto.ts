import { IsOptional, IsString, IsUrl } from 'class-validator';
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';

export class UpdateRepositorioDto {
  id?: number;
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
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
