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
import { UsuarioService } from '../usuario/usuario.service';
import { RepositorioService } from '../repositorio/repositorio.service';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
    private estudiateService: EstudianteService,
    private usuarioService: UsuarioService,
    private seccionService: SeccionService,
    private cursoService: CursoService,
    private docenteService: DocenteService,
    private baseDeDatosService: BaseDeDatosService,
    private gitService: GitService,
    private dockerfileService: DockerfileService,
    private systemService: SystemService,
    private repositoryService: RepositorioService,
  ) { }
  async create(createProyectoDto: CreateProyectoDto, userId: number) {
    const creador = await this.usuarioService.findOne(userId, true);
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
      creador: creador,
      estudiantes: estudiantes,
      seccion: seccion,
      tutor: docente,
      base_de_datos: createProyectoDto.base_de_datos,
      tipo_proyecto: createProyectoDto.tipo_proyecto,
    });
    const guardadoProyecto = await this.proyectoRepository.save(nuevoProyecto);
    const proyectoCreado = await this.findOne(guardadoProyecto.id);
    const puertos: number = proyectoCreado.id * 2 + 9998;
    await this.proyectoRepository.update(
      { id: proyectoCreado.id },
      { puerto: puertos },
    );

    if (proyectoCreado.tipo_proyecto === 'S') {
      await this.repositoryService.create({ tipo: "F", proyecto_id: proyectoCreado.id });
      await this.repositoryService.create({ tipo: "B", proyecto_id: proyectoCreado.id });
    } else {
      await this.repositoryService.create({ tipo: "I", proyecto_id: proyectoCreado.id });
    }

    return await this.findOne(proyectoCreado.id);
  }

  findAll() {
    return (
      this.proyectoRepository
        .createQueryBuilder('proyecto')
        .leftJoin('proyecto.estudiantes', 'estudiante')
        .leftJoinAndSelect('proyecto.seccion', 'seccion')
        .leftJoin('seccion.curso', 'curso')
        .leftJoin('curso.materia', 'materia')
        .leftJoin('proyecto.tutor', 'tutor')
        .leftJoinAndSelect('proyecto.repositorios', 'repositorio')
        .leftJoin('proyecto.base_de_datos', 'baseDeDatos')
        .leftJoin('proyecto.creador', 'creador')

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

        .addSelect([
          'creador.id',
          'creador.nombre',
          'creador.apellido',
          'creador.fecha_nacimiento',
          'creador.sexo',
          'creador.descripcion',
          'creador.correo',
          'creador.red_social',
          'creador.foto_perfil',
          'creador.tipo',
          'creador.est_fecha_inicio',
        ])

        .addSelect(['baseDeDatos.id', 'baseDeDatos.tipo'])

        // Seleccionar campos de curso
        .addSelect([
          'curso.id',
          'curso.grupo',
          'curso.semestre',
          'curso.descripcion',
        ])

        // Seleccionar campos de materia
        .addSelect(['materia.id', 'materia.nombre', 'materia.semestre'])

        .getMany()
    );
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
        'creador',
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
        'creador',
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
   * @param usuarioId The ID of the student whose projects are to be retrieved.
   * @returns A promise that resolves to an array of projects linked to the given student.
   */
  async findAllbyUser(usuarioId: number) {
    return this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('proyecto.seccion', 'seccion')
      .leftJoinAndSelect('proyecto.tutor', 'tutor')
      .leftJoinAndSelect('proyecto.repositorios', 'repositorio')
      .leftJoinAndSelect('proyecto.base_de_datos', 'baseDeDatos')
      .leftJoin('proyecto.creador', 'creador')
      .where('estudiante.id = :id OR creador.id = :id', { id: usuarioId }) // Filtro por estudiante
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
      .addSelect([
        'creador.id',
        'creador.nombre',
        'creador.apellido',
        'creador.fecha_nacimiento',
        'creador.sexo',
        'creador.descripcion',
        'creador.correo',
        'creador.red_social',
        'creador.foto_perfil',
        'creador.tipo',
        'creador.est_fecha_inicio',
      ])
      .addSelect(['baseDeDatos.id', 'baseDeDatos.tipo'])
      .getMany();
  }

  async update(id: number, updateProyectoDto: UpdateProyectoDto) {
    const proyecto = await this.findOne(id);
    if (updateProyectoDto.tipo_proyecto && updateProyectoDto.tipo_proyecto === 'M' && proyecto.tipo_proyecto != updateProyectoDto.tipo_proyecto) {
      await this.repositoryService.remove(proyecto.repositorios[1].id);
      await this.repositoryService.remove(proyecto.repositorios[0].id);
      await this.repositoryService.create({ tipo: "I", proyecto_id: proyecto.id });
    } else if (updateProyectoDto.tipo_proyecto && updateProyectoDto.tipo_proyecto === 'S' && proyecto.tipo_proyecto != updateProyectoDto.tipo_proyecto) {
      await this.repositoryService.remove(proyecto.repositorios[0].id);
      await this.repositoryService.create({ tipo: "F", proyecto_id: proyecto.id });
      await this.repositoryService.create({ tipo: "B", proyecto_id: proyecto.id });
    }

    if (updateProyectoDto.estudiantesIds) {
      const estudiantesActualesIds = proyecto.estudiantes.map((e) => e.id);
  
      // Filtrar estudiantes a agregar
      const estudiantesParaAgregar = updateProyectoDto.estudiantesIds.filter(
        (id) => !estudiantesActualesIds.includes(id),
      );
  
      // Filtrar estudiantes a eliminar
      const estudiantesParaEliminar = estudiantesActualesIds.filter(
        (id) => !updateProyectoDto.estudiantesIds?.includes(id),
      );
  
      // Agregar nuevos estudiantes
      for (const estudianteId of estudiantesParaAgregar) {
        const estudiante = await this.estudiateService.findOne(estudianteId);
        if (estudiante) {
          proyecto.estudiantes.push(estudiante);
        }
      }
  
      // Eliminar estudiantes que ya no están en la nueva lista
      proyecto.estudiantes = proyecto.estudiantes.filter(
        (e) => !estudiantesParaEliminar.includes(e.id),
      );
    }
  
    // **Actualizar los demás datos del proyecto**
    Object.assign(proyecto, updateProyectoDto); 
  
    await this.proyectoRepository.save(proyecto);
    const proyectoActualizado = await this.findOne(id);
    return proyectoActualizado;
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
      let puertos: number = proyect.puerto;
      if (repositorio.tipo === 'B') {
        puertos++;
      }
      // Create Dockerfile
      const dockerfilePath = this.dockerfileService.generateDockerfile(
        rute,
        repositorio.tecnologia,
        puertos,
      );

      //Generate image if is type All
      if (repositorios.length == 1) {
        let port = 3307;
        let host = process.env.MYSQL_CONTAINER_NAME;
        if (proyect.base_de_datos.tipo != 'S') {
          port = 3307;
          host = process.env.MONGO_CONTAINER_NAME;
        }
        await this.dockerfileService.buildAndRunContainer(
          proyect.id as unknown as string,
          rute,
          repositorio.tecnologia,
          puertos,
          ` -e DB_DATABASE=${proyect.base_de_datos.nombre} -e DB_PORT=${port}  -e DB_HOST=${host} -e DB_USER=${proyect.base_de_datos.usuario} -e DB_PASS="${proyect.base_de_datos.contrasenia}"`,
        );
      }

      // Add dockerfiles
      dockerfiles.push({
        proyect_id: proyect.id,
        rute,
        type: repositorio.tipo,
        port: puertos,
        language: repositorio.tecnologia,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return dockerfiles;
  }
}
