/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
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
  ) { }
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

    if (createProyectoDto.base_de_datos)
      createProyectoDto.base_de_datos = await this.baseDeDatosService.create(
        createProyectoDto.base_de_datos,
      );

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
      base_de_datos: createProyectoDto.base_de_datos,
    });
    const guardadoProyecto = await this.proyectoRepository.save(nuevoProyecto);
    return this.findOne(guardadoProyecto.id);
  }

  findAll() {
    return this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoin('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('proyecto.seccion', 'seccion')
      .leftJoin('proyecto.tutor', 'tutor')
      .leftJoinAndSelect('proyecto.repositorios', 'repositorio')
      .leftJoin('proyecto.base_de_datos', 'baseDeDatos')

      .addSelect([
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
      ])

      .addSelect([
        'tutor.id',
        'tutor.nombre',
        'tutor.apellido',
        'tutor.fecha_nacimiento',
        'tutor.sexo',
        'tutor.descripcion',
        'tutor.correo',
        'tutor.red_social',
        'tutor.foto_perfil',
        'tutor.tipo',
      ])

      .addSelect(['baseDeDatos.id', 'baseDeDatos.tipo'])

      .getMany();
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

  /**
   * Retrieves a project by its ID, including its related entities.
   *
   * @param id - The ID of the project to retrieve.
   * @returns A promise resolving to the project with the specified ID.
   * @throws NotFoundException if the project is not found.
   */
  async findOne(id: number) {
    const result = await this.proyectoRepository.findOne({
      where: { id: id },
      relations: [
        'estudiantes',
        'seccion',
        'tutor',
        'repositorios',
        'base_de_datos',
      ],
    });
    if (!result)
      throw new NotFoundException(
        `El proyecto con el id ${id} no se encuentra registrado.`,
      );
    return result;
  }

/**
 * Retrieves all projects associated with a specific student.
 *
 * @param estudianteId The ID of the student whose projects are to be retrieved.
 * @returns A promise that resolves to an array of projects linked to the given student.
 */
  async findAllbyStudent(estudianteId: number) {
    return this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('proyecto.seccion', 'seccion')
      .leftJoinAndSelect('proyecto.tutor', 'tutor')
      .leftJoinAndSelect('proyecto.repositorios', 'repositorio')
      .leftJoinAndSelect('proyecto.base_de_datos', 'baseDeDatos')
      .where('estudiante.id = :id', { id: estudianteId }) // Filtro por estudiante
      .addSelect([
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
      ])
      .addSelect([
        'tutor.id',
        'tutor.nombre',
        'tutor.apellido',
        'tutor.fecha_nacimiento',
        'tutor.sexo',
        'tutor.descripcion',
        'tutor.correo',
        'tutor.red_social',
        'tutor.foto_perfil',
        'tutor.tipo',
      ])
      .addSelect(['baseDeDatos.id', 'baseDeDatos.tipo'])
      .getMany();
  }

  update(id: number, updateProyectoDto: UpdateProyectoDto) {
    return `This action updates a #${id} proyecto`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }

  async cargarProyecto(id: string) {
    //get the proyect
    const proyect = await this.findOne(+id);

    //get repositories
    const repositorios = proyect.repositorios;

    //if project hasn't repositories
    if (repositorios.length == 0)
      throw new NotFoundException(
        `El proyecto con el id ${id} no tiene repositorios asignados.`,
      );

    //get free ports
    const FREE_PORTS = await this.systemService.getAvailablePorts();

    //Rutes of dockerfiles
    const dockerfiles: any[] = [];

    for (const [index, repositorio] of repositorios.entries()) {
      // Clone repository
      const rute = await this.gitService.cloneRepositorio(
        repositorio.url,
        process.env.FOLDER_ROUTE as string,
        proyect.id as unknown as string,
        repositorio.tipo,
      );

      // Create Dockerfile
      const dockerfilePath = this.dockerfileService.generateDockerfile(
        rute,
        repositorio.tecnologia,
        FREE_PORTS[index],
      );

      //Generate image if is type All
      if (repositorios.length == 1) {
        let port= process.env.MYSQL_PORT;
        if(proyect.base_de_datos.tipo!='S'){
          port= process.env.MONGO_PORT;
        } 
        await this.dockerfileService.buildAndRunContainer(
          proyect.id as unknown as string,
          rute,
          repositorio.tecnologia,
          FREE_PORTS[index],
          ` -e DB_DATABASE=${proyect.base_de_datos.nombre} -e DB_PORT=${port}  -e BD_HOST=localhost -e BD_USER=${proyect.base_de_datos.usuario} -e BD_PASS=${proyect.base_de_datos.contrasenia}`
        );
      }

      // Add dockerfiles
      dockerfiles.push({
        proyect_id: proyect.id,
        rute,
        type: repositorio.tipo,
        port: FREE_PORTS[index],
        language: repositorio.tecnologia,
      });
    }

    console.log(dockerfiles);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return dockerfiles;
  }
}
