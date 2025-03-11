import { Injectable } from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { Proyecto } from './entities/proyecto.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { EstudianteService } from '../estudiante/estudiante.service';
import { SeccionService } from '../seccion/seccion.service';
import { Seccion } from '../seccion/entities/seccion.entity';
import { CursoService } from '../curso/curso.service';
import { Curso } from '../curso/entities/curso.entity';
import { DocenteService } from '../docente/docente.service';
import { Docente } from '../docente/entities/docente.entity';
import { BaseDeDatosService } from '../base_de_datos/base_de_datos.service';
import { GitService } from 'src/services/git.service';
import { DockerfileService } from 'src/services/docker.service';
import { SystemService } from 'src/services/system.service';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
    private estudiateService: EstudianteService,
    private seccionService: SeccionService,
    private cursoService: CursoService,
    private docenteService: DocenteService,
    private baseDeDatosService: BaseDeDatosService,
    private gitService: GitService,
    private dockerfileService: DockerfileService,
    private systemService: SystemService,
  ) {}
  async create(createProyectoDto: CreateProyectoDto) {
    let estudiantes: Estudiante[] = [];
    if (
      createProyectoDto.estudiantesIds &&
      createProyectoDto.estudiantesIds.length > 0
    ) {
      estudiantes = await Promise.all(
        createProyectoDto.estudiantesIds.map((estudiante) => {
          return this.estudiateService.findOne(estudiante);
        }),
      );
    }
    const seccion: Seccion = await this.seccionService.findOne(
      createProyectoDto.seccionId,
    );

    const curso: Curso = await this.cursoService.findOne(seccion.curso.id);

    const docente: Docente = await this.docenteService.findOne(
      curso.docente.id,
    );

    const baseDeDatos = await this.baseDeDatosService.create({});

    const nuevoProyecto = this.proyectoRepository.create({
      titulo: createProyectoDto.titulo,
      descripcion: createProyectoDto.descripcion,
      calificacion: createProyectoDto.calificacion,
      url: createProyectoDto.url,
      imagen: createProyectoDto.imagen,
      estado_proyecto: createProyectoDto.estado_proyecto,
      estado_ejecucion: createProyectoDto.estado_ejecucion,
      fecha_creacion: createProyectoDto.fecha_creacion,
      estudiantes: estudiantes,
      seccion: seccion,
      tutor: docente,
      base_de_datos: baseDeDatos,
    });
    const guardadoProyercto = await this.proyectoRepository.save(nuevoProyecto);
    return this.findOne(guardadoProyercto.id);
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

  findAllBySection(id: number) {
    return this.proyectoRepository.find({
      where: { seccion: { id } },
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
    return await this.proyectoRepository.findOne({
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateProyectoDto: UpdateProyectoDto) {
    return `This action updates a #${id} proyecto`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }

  async cargarProyecto(id: string, url) {
    const FREE_PORTS = await this.systemService.getAvailablePorts();
    const rute = await this.gitService.cloneRepositorio(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      url.url,
      process.env.FOLDER_ROUTE as string,
      id,
      'B',
    );
    const crearDockerfile = this.dockerfileService.buildAndRunContainer(
      rute,
      'node',
      FREE_PORTS[0],
    );
    return crearDockerfile;
  }
}
