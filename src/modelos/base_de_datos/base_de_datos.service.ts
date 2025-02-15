import { Injectable } from '@nestjs/common';
import { CreateBaseDeDatoDto } from './dto/create-base_de_dato.dto';
import { UpdateBaseDeDatoDto } from './dto/update-base_de_dato.dto';

@Injectable()
export class BaseDeDatosService {
  create(createBaseDeDatoDto: CreateBaseDeDatoDto) {
    return 'This action adds a new baseDeDato';
  }

  findAll() {
    return `This action returns all baseDeDatos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} baseDeDato`;
  }

  update(id: number, updateBaseDeDatoDto: UpdateBaseDeDatoDto) {
    return `This action updates a #${id} baseDeDato`;
  }

  remove(id: number) {
    return `This action removes a #${id} baseDeDato`;
  }
}
