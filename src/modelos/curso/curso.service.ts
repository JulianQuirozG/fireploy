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
import { MateriaService } from '../materia/materia.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Docente } from '../docente/entities/docente.entity';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
    private materiaService: MateriaService,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}
  async create(createCursoDto: CreateCursoDto) {
    const id: string = `${createCursoDto.materiaId}${createCursoDto.grupo}${createCursoDto.semestre}`;
    const curso = await this.cursoRepository.findOne({ where: { id: id } });
    if (curso) {
      throw new ConflictException(`El curso con el id ${id}, ya existe`);
    }
    let docente;
    if (createCursoDto.docenteId) {
      docente = await this.usuarioRepository.findOne({
        where: { id: +createCursoDto.docenteId, tipo: 'Docente' },
      });
      if (!docente) {
        throw new NotFoundException(
          `El docente con el ID: ${createCursoDto.docenteId} no encontrado `,
        );
      }
    }
    const materia = await this.materiaService.findOne(createCursoDto.materiaId);
    const nuevoCurso = this.cursoRepository.create({
      id,
      grupo: createCursoDto.grupo,
      semestre: createCursoDto.semestre,
      descripcion: createCursoDto.descripcion,
      estado: createCursoDto.estado,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      docente,
      materia, // Aquí asignamos la relación correctamente
    });

    return this.cursoRepository.save(nuevoCurso);
  }

  async findAll() {
    return await this.cursoRepository.find();
  }

  async findAllByMateria(id: number) {
    return await this.cursoRepository.find({
      where: { materia: { id } },
      relations: ['materia'],
    });
  }

  async findOne(id: string) {
    const curso = await this.cursoRepository.findOne({ where: { id: id } });
    if (!curso) {
      throw new NotFoundException('El curso que está buscando no existe');
    }
    return curso;
  }

  async update(id: string, updateCursoDto: UpdateCursoDto) {
    //Verify curso exists
    await this.findOne(id);

    //If docente change verify docente exists
    if (updateCursoDto.docente) {
      const tutor = await this.usuarioRepository.findOne({
        where: {
          id: updateCursoDto.docente as unknown as number,
          tipo: 'Docente',
        },
      });
      if (!tutor) {
        throw new NotFoundException('No existe un docente con ese id');
      }
      updateCursoDto.docente = tutor as Docente;
    }

    //update curso info
    updateCursoDto.id = id;
    await this.cursoRepository.save(updateCursoDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.cursoRepository.delete(id);
  }
}
