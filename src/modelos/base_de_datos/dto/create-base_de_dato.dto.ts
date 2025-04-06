import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateBaseDeDatoPartialDto } from './create-base_de_dato_partial.dto';

export class CreateBaseDeDatoDto extends CreateBaseDeDatoPartialDto {
  @IsNotEmpty({ message: 'El id del proyecto es obligatorio' })
  @IsNumber()
  proyecto_id: number;
}
