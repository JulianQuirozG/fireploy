import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
  ) {}
  create(createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteRepository.save(createEstudianteDto);
  }

  findAll() {
    return this.estudianteRepository.find({
      relations: ['proyectos', 'cursos'],
    });
  }

  async findOne(id: number) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: id },
      relations: ['proyectos', 'cursos'],
    });
    if (!estudiante) {
      throw new NotFoundException(`El usuario con el id ${id} no existe`);
    }
    return estudiante;
  }

  update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
    return `This action updates a #${id} estudiante`;
  }

  remove(id: number) {
    return `This action removes a #${id} estudiante`;
  }
}
