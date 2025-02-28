import { Injectable } from '@nestjs/common';
import { CreateBaseDeDatoDto } from './dto/create-base_de_dato.dto';
import { UpdateBaseDeDatoDto } from './dto/update-base_de_dato.dto';
import { BaseDeDato } from './entities/base_de_dato.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BaseDeDatosService {
  constructor(
    @InjectRepository(BaseDeDato)
    private baseDeDatosRepository: Repository<BaseDeDato>,
  ) {}
  create(createBaseDeDatoDto: CreateBaseDeDatoDto) {
    //save new Base de datos
    const baseDeDatos = this.baseDeDatosRepository.save(createBaseDeDatoDto);
    return baseDeDatos;
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
