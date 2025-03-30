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
import { addEstudiantesCursoDto } from './dto/add-estudiantes-curso.dto';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { EstudianteService } from '../estudiante/estudiante.service';
import { DocenteService } from '../docente/docente.service';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
    private materiaService: MateriaService,
    private usuarioService: UsuarioService,
    private estudianteService: EstudianteService,
    private docenteService: DocenteService,
  ) {}
  async create(createCursoDto: CreateCursoDto) {
    const id: string = `${createCursoDto.materiaId}${createCursoDto.grupo}${createCursoDto.semestre}`;
    const curso = await this.cursoRepository.findOne({ where: { id: id } });
    if (curso) {
      throw new ConflictException(`El curso con el id ${id}, ya existe`);
    }
    let docente;
    if (createCursoDto.docenteId) {
      const docentes = await this.usuarioService.findAll(
        {
          id: +createCursoDto.docenteId,
          tipo: 'Docente',
        },
        true,
      );
      if (!docentes || docentes.length === 0) {
        throw new NotFoundException(
          `El docente con el ID: ${createCursoDto.docenteId} no encontrado o no es docente`,
        );
      }
      docente = docentes[0] as Docente;
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
    const query = this.cursoRepository
      .createQueryBuilder('curso')
      .leftJoinAndSelect('curso.materia', 'materia')
      .leftJoinAndSelect('curso.docente', 'docente')
      .leftJoinAndSelect('curso.secciones', 'seccion')
      .leftJoinAndSelect('curso.estudiantes', 'estudiante')
      .select([
        'curso.id',
        'curso.grupo',
        'curso.semestre',
        'curso.descripcion',
        'curso.estado',
        'materia.id',
        'materia.nombre',
        'materia.semestre',
        'materia.estado',
        'docente.id',
        'docente.nombre',
        'docente.apellido',
        'docente.fecha_nacimiento',
        'docente.sexo',
        'docente.descripcion',
        'docente.correo',
        'docente.red_social',
        'docente.foto_perfil',
        'docente.tipo',
        'docente.est_fecha_inicio',
        'docente.estado',
        'seccion.id',
        'seccion.titulo',
        'seccion.descripcion',
        'seccion.fecha_inicio',
        'seccion.fecha_fin',
        'seccion.estado',
        'estudiante.id',
        'estudiante.nombre',
        'estudiante.apellido',
        'estudiante.fecha_nacimiento',
        'estudiante.sexo',
        'estudiante.descripcion',
        'estudiante.correo',
        'estudiante.red_social',
        'estudiante.foto_perfil',
        'estudiante.tipo',
        'estudiante.est_fecha_inicio',
        'estudiante.estado',
      ]);

    if (filters) {
      if (filters.materia) {
        const existMateria = await this.materiaService.findOne(
          +filters.materia,
        );
        if (!existMateria) {
          throw new BadRequestException(
            `La materia con id ${filters.materia} no existe`,
          );
        }
        query.andWhere('materia.id = :materiaId', {
          materiaId: filters.materia,
        });
      }

      if (filters.docente) {
        const existDocente = await this.docenteService.findOne(
          +filters.docente,
        );
        if (!existDocente) {
          throw new BadRequestException(
            `El docente con id ${filters.docente} no existe`,
          );
        }
        query.andWhere('docente.id = :docenteId', {
          docenteId: filters.docente,
        });
      }
    }

    return await query.getMany();
  }

  async findAllByMateria(id: number) {
    return await this.cursoRepository.find({
      where: { materia: { id } },
      relations: ['materia', 'docente', 'estudiantes'],
    });
  }

  async findOne(id: string) {
    const query = this.cursoRepository
      .createQueryBuilder('curso')
      .leftJoinAndSelect('curso.materia', 'materia')
      .leftJoinAndSelect('curso.docente', 'docente')
      .leftJoinAndSelect('curso.secciones', 'seccion')
      .leftJoinAndSelect('curso.estudiantes', 'estudiante')
      .select([
        'curso.id',
        'curso.grupo',
        'curso.semestre',
        'curso.descripcion',
        'curso.estado',
        'materia.id',
        'materia.nombre',
        'materia.semestre',
        'materia.estado',
        'docente.id',
        'docente.nombre',
        'docente.apellido',
        'docente.fecha_nacimiento',
        'docente.sexo',
        'docente.descripcion',
        'docente.correo',
        'docente.red_social',
        'docente.foto_perfil',
        'docente.tipo',
        'docente.est_fecha_inicio',
        'docente.estado',
        'seccion.id',
        'seccion.titulo',
        'seccion.descripcion',
        'seccion.fecha_inicio',
        'seccion.fecha_fin',
        'seccion.estado',
        'estudiante.id',
        'estudiante.nombre',
        'estudiante.apellido',
        'estudiante.fecha_nacimiento',
        'estudiante.sexo',
        'estudiante.descripcion',
        'estudiante.correo',
        'estudiante.red_social',
        'estudiante.foto_perfil',
        'estudiante.tipo',
        'estudiante.est_fecha_inicio',
        'estudiante.estado',
      ])
      .where('curso.id = :id', { id });

    const curso = await query.getOne();

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
      const tutor = await this.usuarioService.findAll(
        {
          id: +updateCursoDto.docente,
          tipo: 'Docente',
        },
        true,
      );
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

  async addStudents(id: string, addEstudiantes: addEstudiantesCursoDto) {
    const curso = await this.findOne(id);
    const estudantes: Estudiante[] = await Promise.all(
      addEstudiantes.estudiantes.map((estudiante) => {
        return this.estudianteService.findOne(estudiante);
      }),
    );
    let nuevoEstudantes: Estudiante[];
    if (addEstudiantes.operacion == 'A') {
      // Unir arrays sin repetir valores (basado en ID)
      nuevoEstudantes = [
        ...curso.estudiantes,
        ...estudantes.filter(
          (nuevo) => !curso.estudiantes.some((est) => est.id === nuevo.id),
        ),
      ];
    } else {
      // Eliminar estudiantes de curso basados en ID
      nuevoEstudantes = curso.estudiantes.filter(
        (item) => !estudantes.some((est) => est.id === item.id),
      );
    }

    curso.estudiantes = nuevoEstudantes;
    await this.cursoRepository.save(curso);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return;
  }
}
