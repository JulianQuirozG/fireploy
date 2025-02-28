import { Injectable } from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { Proyecto } from './entities/proyecto.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
//import { EstudianteService } from '../estudiante/estudiante.service';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
    //private estudianteRepository: EstudianteService,
  ) {}
  async create(createProyectoDto: CreateProyectoDto) {
    const nuevoProyecto = this.proyectoRepository.create({
      descripcion: createProyectoDto.descripcion,
    });
    return await this.proyectoRepository.save(nuevoProyecto);
  }

  findAll() {
    return this.proyectoRepository.find({
      relations: [
        'estudiantes',
        'seccion',
        'tutor',
        'repositorios',
        'base_de_datos',
      ],
    });
  }

  async findOne(id: number) {
    return this.proyectoRepository.findOne({
      where: { id: id },
      relations: [
        'estudiantes',
        'seccion',
        'tutor',
        'repositorios',
        'base_de_datos',
      ],
    });
  }

  update(id: number, updateProyectoDto: UpdateProyectoDto) {
    return `This action updates a #${id} proyecto`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }
}
