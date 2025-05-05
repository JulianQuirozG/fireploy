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
import * as xlsx from 'xlsx';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

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
      materia,
    });

    await this.cursoRepository.save(nuevoCurso);
    return this.findOne(id);
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

      if (filters.estudiantes) {
        const existEstudiante = await this.estudianteService.findOne(
          +filters.estudiantes,
        );
        if (!existEstudiante) {
          throw new BadRequestException(
            `El estudiante con id ${filters.estudiantes} no existe`,
          );
        }
        query.andWhere('estudiante.id = :estudianteId', {
          estudianteId: filters.estudiantes,
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

  async UploadCurso(file: Express.Multer.File) {
      //Verify file exits
      if (!file) {
        throw new BadRequestException('No se ha cargado ningún archivo');
      }
  
      //Verify file extension
      if (
        !(process.env.ALLOWED_MIME_TYPES as unknown as string[]).includes(
          file.mimetype,
        )
      ) {
        throw new Error('El archivo debe ser un Excel (.xls o .xlsx)');
      }
  
      // read the file content
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      const cursos = plainToInstance(CreateCursoDto, data);
      const errors: any[] = [];
  
      for (const curso of cursos) {
        const errores = await validate(curso);
        if (errores.length > 0) errors.push(errores);
      }
  
      if (errors.length > 0)
        return { mensaje: 'Algunos de los cursos no se pudieron cargar', errors };
  
      for (const curso of cursos) {
        try {
          await this.create(curso);
        } catch (error) {
          errors.push({
            tittle: `El curso ${curso.grupo} no se pudo registrar`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            message: error.message,
          });
        }
      }
  
      if (errors.length > 0)
        return { mensaje: 'Alguno de los cursos no se pudieron cargar', errors };
      else {
        return { mensaje: 'Cursos cargados con éxito' };
      }
    }
}
