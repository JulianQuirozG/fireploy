import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
  ) {}
  async create(createCursoDto: CreateCursoDto) {
    const id: string = `${createCursoDto.materiaId}${createCursoDto.grupo}${createCursoDto.semestre}`;
    const curso = await this.cursoRepository.findOne({ where: { id: id } });
    if (curso) {
      throw new ConflictException(`El curso con el id ${id}, ya existe`);
    }
    createCursoDto.id = id;
    return this.cursoRepository.save(createCursoDto);
  }

  async findAll() {
    return await this.cursoRepository.find();
  }
  /* 
  async findAllByMateria(id: number) {
    return await this.cursoRepository.find({
      where: { materia: { id } },
      relations: ['materia'],
    });
  }
*/
  async findOne(id: string) {
    const curso = await this.cursoRepository.findOne({ where: { id: id } });
    if (!curso) {
      throw new NotFoundException('El curso que está buscando no existe');
    }
    return curso;
  }

  async update(id: string, updateCursoDto: UpdateCursoDto) {
    await this.findOne(id);
    await this.cursoRepository.update(id, updateCursoDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.cursoRepository.delete(id);
  }
}
