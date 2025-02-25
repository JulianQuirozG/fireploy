import {
  BadRequestException,
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
import { Docente } from '../docente/entities/docente.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { FilterCursoDto } from './dto/filter-curso.dto';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
    private materiaService: MateriaService,
    private usuarioService: UsuarioService,
  ) {}
  async create(createCursoDto: CreateCursoDto) {
    const id: string = `${createCursoDto.materiaId}${createCursoDto.grupo}${createCursoDto.semestre}`;
    const curso = await this.cursoRepository.findOne({ where: { id: id } });
    if (curso) {
      throw new ConflictException(`El curso con el id ${id}, ya existe`);
    }
    let docente;
    if (createCursoDto.docenteId) {
      docente = await this.usuarioService.findAll({
        id: +createCursoDto.docenteId,
        tipo: 'Docente',
      });
      if (!docente) {
        throw new NotFoundException(
          `El docente con el ID: ${createCursoDto.docenteId} no encontrado o no es docente`,
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

  async findAll(filters?: FilterCursoDto) {
    if (filters) {
      const { materia } = filters;
      const materiaId = materia as unknown as string;

      //verify curso exists
      if (materiaId) {
        const exist = await this.materiaService.findOne(+materiaId);

        if (!exist)
          throw new BadRequestException(
            `La materia con id ${materiaId} No existe`,
          );

        filters.materia = exist;
      }
    }
    return await this.cursoRepository.find({
      where: filters,
      relations: ['materia', 'docente'],
    });
  }

  async findAllByMateria(id: number) {
    return await this.cursoRepository.find({
      where: { materia: { id } },
      relations: ['materia', 'docente'],
    });
  }

  async findOne(id: string) {
    const curso = await this.cursoRepository.findOne({
      where: { id: id },
      relations: ['materia', 'docente'],
    });
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
      const tutor = await this.usuarioService.findAll({
        id: +updateCursoDto.docente,
        tipo: 'Docente',
      });
      if (!tutor) {
        throw new NotFoundException('No existe un docente con ese id');
      }
      updateCursoDto.docente = tutor[0] as Docente;
    }

    //update curso info
    updateCursoDto.id = id;
    await this.cursoRepository.save(updateCursoDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return;
  }
}
