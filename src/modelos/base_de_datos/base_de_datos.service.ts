import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBaseDeDatoDto } from './dto/create-base_de_dato.dto';
import { UpdateBaseDeDatoDto } from './dto/update-base_de_dato.dto';
import { BaseDeDato } from './entities/base_de_dato.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DockerfileService } from 'src/services/docker.service';

@Injectable()
export class BaseDeDatosService {
  constructor(
    @InjectRepository(BaseDeDato)
    private baseDeDatosRepository: Repository<BaseDeDato>,
    private dockerfileService: DockerfileService,
  ) {}
  async create(createBaseDeDatoDto: CreateBaseDeDatoDto) {
    //save new Base de datos
    const baseDeDatos = await this.baseDeDatosRepository.save(createBaseDeDatoDto);
    let data;
    if(createBaseDeDatoDto.tipo == 'N'){
    //  data = await this.dockerfileService.createMySQLDatabaseAndUser(process.env.MYSQL_CONTAINER_NAME || 'databasesql',baseDeDatos,baseDeDatos.usuario,baseDeDatos.contrasenia);
    }
    else{
   //   data = await this.dockerfileService.createMySQLDatabaseAndUser(process.env.MONGO_CONTAINER_NAME || 'databaseNosql',baseDeDatos.proyecto.id,baseDeDatos.usuario,baseDeDatos.contrasenia);
    }

    
    return baseDeDatos;
  }

  findAll() {
    return this.baseDeDatosRepository.find();
  }

  async findOne(id: number) {
    const baseDeDatos = await this.baseDeDatosRepository.findOne({
      where: { id: id },
      relations: ['proyecto'],
    });

    if (!baseDeDatos) {
      throw new NotFoundException(
        `No se ha encontrado una base de datos con id ${id}`,
      );
    }

    return baseDeDatos;
  }

  async update(id: number, updateBaseDeDatoDto: UpdateBaseDeDatoDto) {
    //Verify exists data base
    const baseDeDatos = await this.findOne(id);

    if (!baseDeDatos) {
      throw new NotFoundException(
        `No se ha encontrado una base de datos con id ${id}`,
      );
    }

    await this.baseDeDatosRepository.save({ id, ...updateBaseDeDatoDto });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.baseDeDatosRepository.delete(id);
  }
}
