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

  /**
   * Creates a new (docente) record in the system.
   *
   * @param createDocenteDto - Data transfer object containing the teacher's information.
   *
   * @returns The newly created teacher entity.
   */
  create(createDocenteDto: CreateDocenteDto) {
    return this.docenteRepository.save(createDocenteDto);
  }

  /**
   * Retrieves all teachers (docentes) from the system, including their related
   * directed projects and courses.
   *
   * @returns An array of teacher entities with their associated projects and courses.
   */
  findAll() {
    return this.docenteRepository.find({
      relations: ['proyectos_dirigidos', 'cursos_dirigidos'],
    });
  }

  /**
   * Retrieves a single docente by their ID
   *
   * @param id - The unique identifier of the teacher to retrieve.
   *
   * @returns The teacher entity with associated projects and courses.
   *
   * @throws {NotFoundException} If no teacher is found with the provided ID.
   */
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
