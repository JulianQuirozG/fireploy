import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { Repository } from 'typeorm';
import { Docente } from './entities/docente.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DocenteService {
  constructor(
    @InjectRepository(Docente)
    private docenteRepository: Repository<Docente>,
  ) {}
  create(createDocenteDto: CreateDocenteDto) {
    return this.docenteRepository.save(createDocenteDto);
  }

  findAll() {
    return this.docenteRepository.find({
      relations: ['proyectos_dirigidos', 'cursos_dirigidos'],
    });
  }

  async findOne(id: number) {
    const docente = await this.docenteRepository.findOne({
      where: { id: id },
      relations: ['proyectos_dirigidos', 'cursos_dirigidos'],
    });
    if (!docente) {
      throw new NotFoundException(`El docente con el id ${id} no existe`);
    }
    return docente;
  }

  update(id: number, updateDocenteDto: UpdateDocenteDto) {
    return `This action updates a #${id} docente`;
  }

  remove(id: number) {
    return `This action removes a #${id} docente`;
  }
}
