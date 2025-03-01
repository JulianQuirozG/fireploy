import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.baseDeDatosRepository.find();
  }

  async findOne(id: number) {
    const baseDeDatos = await this.baseDeDatosRepository.findOne({
      where: { id: id },
    });
    if (!baseDeDatos) {
      throw new NotFoundException();
    }
    return baseDeDatos;
  }

  update(id: number, updateBaseDeDatoDto: UpdateBaseDeDatoDto) {
    return `This action updates a #${id} baseDeDato`;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.baseDeDatosRepository.delete(id);
  }
}
