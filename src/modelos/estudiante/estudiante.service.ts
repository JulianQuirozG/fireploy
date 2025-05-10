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

  /**
   * Creates and saves a new student in the database.
   *
   * @param createEstudianteDto - An object containing the required data to create a student.
   * @returns A promise that resolves with the saved student, including the generated ID and any persisted fields.
   */
  create(createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteRepository.save(createEstudianteDto);
  }

  /**
   * Retrieves all students from the database, including their related projects and courses.
   *
   * @returns A promise that resolves with an array of students, each with their associated projects and courses.
   */
  findAll() {
    return this.estudianteRepository.find({
      relations: ['proyectos', 'cursos'],
    });
  }

  /**
   * Retrieves a single student by their ID, including their related projects and courses.
   *
   * @param id - The ID of the student to retrieve.
   * @returns A promise that resolves with the student object if found, including their related projects and courses.
   * @throws NotFoundException if no student is found with the given ID.
   */
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
