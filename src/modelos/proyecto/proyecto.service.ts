/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { UsuarioService } from '../usuario/usuario.service';
import { RepositorioService } from '../repositorio/repositorio.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from 'src/socket/notification.gateway';
import { CreateNotificacioneDto } from '../notificaciones/dto/create-notificacione.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { FirebaseService } from 'src/services/firebase.service';
import { DeployQueueService } from 'src/Queue/Services/deploy.service';
import { ProjectManagerQueueService } from 'src/Queue/Services/projects_manager.service';
import { LogService } from '../log/log.service';
import { deleteQueueService } from 'src/Queue/Services/delete.service';

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
    private repositoryService: RepositorioService,
    private deployQueueService: DeployQueueService,
    private projectManagerQueueService: ProjectManagerQueueService,
    private projectDeleteQueueService: deleteQueueService,
    private jwtService: JwtService,
    private socketService: NotificationsGateway,
    private notificacionService: NotificacionesService,
    private firebaseService: FirebaseService,
    private logService: LogService,
  ) {}

  /**
   * Creates a new project, assigns related entities
   *
   * @param createProyectoDto - The data transfer object containing project creation details,
   * including optional database information and student IDs.
   * @param userId - The ID of the user creating the project.
   * @returns A promise that resolves with the newly created project, fully populated with related entities.
   *
   * @throws BadRequestException if a database with the same name already exists.
   */
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

    if (!curso.docente) {
      throw new BadRequestException(
        `El curso no cuenta con un docente asignado.`,
      );
    }

    const docente: Docente = await this.docenteService.findOne(
      curso.docente.id,
    );

    if (createProyectoDto.base_de_datos) {
      const db = await this.baseDeDatosService.findAll({
        nombre: createProyectoDto.base_de_datos.nombre,
      });
      if (db.length > 0)
        throw new BadRequestException(
          `Ya se encuentra registrada una base de datos con el nombre ${createProyectoDto.base_de_datos.nombre}`,
        );
    }

    const nuevoProyecto = this.proyectoRepository.create({
      titulo: createProyectoDto.titulo,
      descripcion: createProyectoDto.descripcion,
      url: createProyectoDto.url || '',
      imagen: createProyectoDto.imagen,
      estado_proyecto: createProyectoDto.estado_proyecto || 'A',
      estado_ejecucion: createProyectoDto.estado_ejecucion || 'F',
      fecha_creacion: createProyectoDto.fecha_creacion || new Date(Date.now()),
      creador: creador,
      estudiantes: estudiantes,
      seccion: seccion,
      tutor: docente,
      tipo_proyecto: createProyectoDto.tipo_proyecto,
    });

    const guardadoProyecto = await this.proyectoRepository.save(nuevoProyecto);

    if (createProyectoDto.base_de_datos)
      createProyectoDto.base_de_datos = await this.baseDeDatosService.create({
        ...createProyectoDto.base_de_datos,
        proyecto_id: guardadoProyecto.id,
      });
    const proyectoCreado = await this.findOne(guardadoProyecto.id);
    const puertos: number = proyectoCreado.id * 2 + 9998;
    await this.proyectoRepository.update(
      { id: proyectoCreado.id },
      { puerto: puertos },
    );

    if (proyectoCreado.tipo_proyecto === 'S') {
      await this.repositoryService.create({
        tipo: 'F',
        proyecto_id: proyectoCreado.id,
      });
      await this.repositoryService.create({
        tipo: 'B',
        proyecto_id: proyectoCreado.id,
      });
    } else {
      await this.repositoryService.create({
        tipo: 'I',
        proyecto_id: proyectoCreado.id,
      });
    }

    return await this.findOne(proyectoCreado.id);
  }

  /**
   * Retrieves all projects from the database with detailed relational
   *
   * @returns A promise that resolves with an array of projects, each populated with
   * their related entities and selected fields for performance optimization.
   */
  async findAll(own: any) {
    const { isInProject } = own;
    const query = await this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoin('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('proyecto.seccion', 'seccion')
      .leftJoin('seccion.curso', 'curso')
      .leftJoin('curso.materia', 'materia')
      .leftJoin('proyecto.tutor', 'tutor')
      .leftJoin('proyecto.repositorios', 'repositorio')
      .leftJoin('proyecto.base_de_datos', 'baseDeDatos')
      .leftJoin('proyecto.creador', 'creador')
      .leftJoin('proyecto.fav_usuarios', 'favorito')

      .addSelect([
        'repositorio.id',
        'repositorio.url',
        'repositorio.tipo',
        'repositorio.tecnologia',
        'repositorio.version',
        'repositorio.framework',
      ])

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

      .addSelect(['favorito.id', 'favorito.nombre'])

      .addSelect([
        'curso.id',
        'curso.grupo',
        'curso.semestre',
        'curso.descripcion',
      ])

      .addSelect(['materia.id', 'materia.nombre', 'materia.semestre']);

    if (!isInProject) {
      query.andWhere('proyecto.estado_proyecto = :estado_proyecto', {
        estado_proyecto: 'A',
      });
    }

    return query.getMany();
  }

  /**
   * Retrieves all projects that belong to a specific section by section ID
   *
   * @param id - The ID of the section to filter projects by.
   * @returns A promise that resolves with an array of projects related to the specified section.
   */
  findAllBySection(id: number) {
    return this.proyectoRepository.find({
      where: { seccion: { id }, estado_proyecto: 'A' },
      relations: [
        'estudiantes',
        'seccion',
        'tutor',
        'repositorios',
        'base_de_datos',
        'creador',
        'fav_usuarios',
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
    const result = await this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoin('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('proyecto.seccion', 'seccion')
      .leftJoin('seccion.curso', 'curso')
      .leftJoin('curso.materia', 'materia')
      .leftJoin('proyecto.tutor', 'tutor')
      .leftJoin('proyecto.repositorios', 'repositorio')
      .leftJoinAndSelect('repositorio.ficheros', 'fichero')
      .leftJoin('proyecto.base_de_datos', 'baseDeDatos')
      .leftJoin('proyecto.creador', 'creador')
      .leftJoin('proyecto.fav_usuarios', 'favorito')

      // Select repositorio excepto variables_de_entorno
      .addSelect([
        'repositorio.id',
        'repositorio.url',
        'repositorio.tipo',
        'repositorio.variables_de_entorno',
        'repositorio.tecnologia',
        'repositorio.version',
        'repositorio.framework',
      ])

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

      .addSelect([
        'baseDeDatos.id',
        'baseDeDatos.usuario',
        'baseDeDatos.nombre',
        'baseDeDatos.contrasenia',
        'baseDeDatos.url',
        'baseDeDatos.tipo',
      ])

      .addSelect([
        'curso.id',
        'curso.grupo',
        'curso.semestre',
        'curso.descripcion',
      ])

      .addSelect(['favorito.id', 'favorito.nombre'])

      .addSelect(['favorito.id', 'favorito.nombre'])

      .addSelect(['materia.id', 'materia.nombre', 'materia.semestre'])

      .where('proyecto.id = :id', { id })

      .getOne();

    if (!result)
      throw new NotFoundException(
        `El proyecto con el id ${id} no se encuentra registrado.`,
      );
    //convertimos lo buffer en base64 para pasarlo por la cola del worker
    if (result.repositorios && result.repositorios.length > 0) {
      result.repositorios.forEach((repositorio) => {
        if (repositorio.ficheros && repositorio.ficheros.length > 0) {
          repositorio.ficheros.forEach((fichero) => {
            if (fichero.contenido) {
              const buffer = Buffer.isBuffer(fichero.contenido)
                ? fichero.contenido
                : Buffer.from(fichero.contenido); // por si llega como Uint8Array
              fichero.contenido = buffer.toString('base64');
            }
          });
        }
      });
    }

    return result;
  }

  /**
   * Retrieves a project by its ID, including only **publicly safe** related entities and fields.
   *
   * This method is intended for public access (no authentication required),
   * so it restricts sensitive information from being loaded, such as environment variables
   * or internal-only fields.
   *
   * Relations included:
   * - Estudiantes (basic public profile)
   * - Sección, Curso y Materia
   * - Tutor y Creador (basic public profile)
   * - Repositorios (excluding variables_de_entorno)
   * - Base de datos (only type)
   * - Usuarios que marcaron como favorito (id y nombre)
   *
   * @param id - The ID of the project to retrieve.
   * @returns A promise resolving to the public version of the project with the specified ID.
   * @throws NotFoundException if the project is not found.
   */
  async findOnePublic(id: number) {
    const result = await this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoin('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('proyecto.seccion', 'seccion')
      .leftJoin('seccion.curso', 'curso')
      .leftJoin('curso.materia', 'materia')
      .leftJoin('proyecto.tutor', 'tutor')
      .leftJoin('proyecto.repositorios', 'repositorio')
      .leftJoin('proyecto.base_de_datos', 'baseDeDatos')
      .leftJoin('proyecto.creador', 'creador')
      .leftJoin('proyecto.fav_usuarios', 'favorito')

      // Select repositorio excepto variables_de_entorno
      .addSelect([
        'repositorio.id',
        'repositorio.url',
        'repositorio.tipo',
        'repositorio.tecnologia',
        'repositorio.version',
        'repositorio.framework',
      ])

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

      .addSelect(['baseDeDatos.tipo'])

      .addSelect(['curso.id', 'curso.grupo', 'curso.semestre'])

      .addSelect(['favorito.id', 'favorito.nombre'])

      .addSelect(['favorito.id', 'favorito.nombre'])

      .addSelect(['materia.id', 'materia.nombre', 'materia.semestre'])

      .where('proyecto.id = :id', { id })
      .andWhere('proyecto.estado_proyecto = :estado_proyecto', {
        estado_proyecto: 'A',
      })
      .getOne();

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
  async findAllbyUser(usuarioId: number, own: any) {
    const { isInProject } = own;
    const query = await this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.estudiantes', 'estudiante')
      .leftJoinAndSelect('proyecto.seccion', 'seccion')
      .leftJoinAndSelect('seccion.curso', 'curso')
      .leftJoinAndSelect('curso.materia', 'materia')
      .leftJoinAndSelect('proyecto.tutor', 'tutor')
      .leftJoinAndSelect('proyecto.repositorios', 'repositorio')
      .leftJoin('proyecto.base_de_datos', 'baseDeDatos')
      .leftJoinAndSelect('proyecto.creador', 'creador')
      .leftJoin('proyecto.fav_usuarios', 'favorito')
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
      .addSelect([
        'repositorio.id',
        'repositorio.url',
        'repositorio.tipo',
        'repositorio.tecnologia',
        'repositorio.version',
        'repositorio.framework',
      ])
      .addSelect(['baseDeDatos.id', 'baseDeDatos.tipo'])
      .addSelect(['favorito.id', 'favorito.nombre']);

    if (!isInProject) {
      query.andWhere('proyecto.estado_proyecto = :estado_proyecto', {
        estado_proyecto: 'A',
      });
    }

    return query.getMany();
  }

  /**
   * Updates an existing project by its ID with the provided data
   *
   * @param id - The ID of the project to update.
   * @param updateProyectoDto - An object containing the updated fields and associations for the project.
   * @returns A promise that resolves with the updated project, including all current relations.
   *
   * @throws NotFoundException if the project with the given ID does not exist.
   */
  async update(id: number, updateProyectoDto: UpdateProyectoDto) {
    const proyecto = await this.findOne(id);

    //if type project changes
    if (
      updateProyectoDto.tipo_proyecto &&
      updateProyectoDto.tipo_proyecto === 'M' &&
      proyecto.tipo_proyecto != updateProyectoDto.tipo_proyecto
    ) {
      await this.repositoryService.remove(proyecto.repositorios[1].id);
      await this.repositoryService.remove(proyecto.repositorios[0].id);
      proyecto.repositorios = [];
      proyecto.repositorios.push(
        await this.repositoryService.create({
          tipo: 'I',
          proyecto_id: proyecto.id,
        }),
      );
    } else if (
      updateProyectoDto.tipo_proyecto &&
      updateProyectoDto.tipo_proyecto === 'S' &&
      proyecto.tipo_proyecto != updateProyectoDto.tipo_proyecto
    ) {
      await this.repositoryService.remove(proyecto.repositorios[0].id);
      proyecto.repositorios = [];
      proyecto.repositorios.push(
        await this.repositoryService.create({
          tipo: 'F',
          proyecto_id: proyecto.id,
        }),
      );
      proyecto.repositorios.push(
        await this.repositoryService.create({
          tipo: 'B',
          proyecto_id: proyecto.id,
        }),
      );
    }

    //If estudiantes changes
    if (updateProyectoDto.estudiantesIds) {
      const estudiantesActualesIds = proyecto.estudiantes.map((e) => e.id);

      // Filtrar estudiantes a agregar
      const estudiantesParaAgregar = updateProyectoDto.estudiantesIds.filter(
        (id) => !estudiantesActualesIds.includes(id),
      );

      for (const userId of estudiantesParaAgregar) {
        const estudiante = await this.estudiateService.findOne(userId);
        if (estudiante && estudiante.id != proyecto.creador.id) {
          //set notificacion
          const notificacion: CreateNotificacioneDto = {
            titulo: `Ahora eres colaborador de un proyecto`,
            mensaje: `Has sido agregado como colaborador del proyecto "${proyecto.titulo} - ${proyecto.id}"`,
            tipo: 1,
            fecha_creacion: new Date(Date.now()),
            visto: false,
            usuario: estudiante,
          };

          //save notificacion
          await this.notificacionService.create(notificacion);

          //Send notificacion
          this.socketService.sendToUser(
            notificacion.usuario.id,
            'Has sido agregado a un proyecto',
          );
        }
      }

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

  async remove(id: number) {
    const project = await this.proyectoRepository.findOne({
      where: { id },
      relations: [
        'estudiantes',
        'seccion',
        'tutor',
        'repositorios',
        'base_de_datos',
        'creador',
        'fav_usuarios',
      ],
    });

    if (project) await this.projectDeleteQueueService.enqueDelete(project);
    if (project) await this.proyectoRepository.remove(project);

    console.log(project);
    //remove database
    if (project?.base_de_datos)
      await this.baseDeDatosService.remove(project.base_de_datos.id);
  }

  /**
   * Loads a project by its ID and enqueues a system job to clone its associated repositories.
   *
   * @param id - The ID of the project to load.
   * @returns A promise that resolves with the result of the repository cloning process.
   *
   * @throws NotFoundException if the project has no repositories assigned.
   * @throws BadRequestException if an error occurs while cloning the project repositories.
   */
  async cargarProyecto(id: string) {
    //get the project
    const proyect = await this.findOne(+id);

    //If project is already loading
    if (proyect.estado_ejecucion == 'L')
      throw new BadRequestException(
        'El proyecto ya se encuentra en cola de despliegue',
      );

    //Set proyecto status in Loading
    proyect.estado_ejecucion = 'L';
    await this.update(+id, proyect);

    //set notificacion
    const notificacion: CreateNotificacioneDto = {
      titulo: `Proyecto cargado con exito`,
      mensaje: '',
      tipo: 1,
      fecha_creacion: new Date(Date.now()),
      visto: false,
      usuario: proyect.creador,
    };

    //get repositories
    const repositorios = proyect.repositorios;

    //if project hasn't repositories
    if (repositorios.length == 0) {
      //Set proyecto status in Error
      proyect.estado_ejecucion = 'E';
      await this.update(+id, proyect);

      //Set notificacion
      notificacion.titulo = `Error al cargar el proyecto `;
      notificacion.mensaje = `Al intentar cargar el proyecto ${proyect.id}-${proyect.titulo}, se ha generado un código de error 000`;

      //save notificacion
      await this.notificacionService.create(notificacion);

      //Send notificacion
      this.socketService.sendToUser(proyect.creador.id, 'Proyecto cargado');
      throw new NotFoundException(
        `El proyecto con el id ${id} no tiene repositorios asignados.`,
      );
    }
    let dockerfiles: any;
    try {
      dockerfiles = await this.deployQueueService.enqueDeploy({
        proyect: proyect,
        repositorios: repositorios,
      });
    } catch (e) {
      //Set proyecto status in Error
      proyect.estado_ejecucion = 'E';
      await this.update(+id, proyect);

      console.log(e.message);
      //Save notificacion
      notificacion.titulo = `Error al cargar un proyecto`;
      notificacion.mensaje = `Al intentar cargar el proyecto ${proyect.id}-${proyect.titulo}, se ha generado el siguiente mensaje de error ${e.message.slice(-13)}`;
      await this.notificacionService.create(notificacion);

      //Send notificacion
      this.socketService.sendToUser(proyect.creador.id, 'Proyecto fallido');

      //save logs
      for (const repositorio of repositorios) {
        //Save log
        await this.logService.create({
          fecha_registro: new Date(Date.now()),
          log: e.message.slice(0, 10000),
          repositorioId: repositorio.id,
        });
      }
      throw new BadRequestException(
        `Ha ocurrido un error al cargar el proyecto`,
        e.message,
      );
    } finally {
      const awaiting_projects = await this.deployQueueService.getWaitingJobs();
      for (const projects of awaiting_projects) {
        const userId = projects.data.proyect.creador.id;
        const projectId = projects.data.proyect.id;
        const position = projects.position;
        //Send notificacion
        this.socketService.sendUpdateDeployPosition(userId, {
          userId: userId,
          projectId: projectId,
          position: position,
        });
      }
    }

    //Set proyecto status in Online
    proyect.estado_ejecucion = 'N';
    await this.update(+id, proyect);

    //Set notificacion
    notificacion.mensaje = `Se ha cargado con exito tu proyecto ${proyect.id}-${proyect.titulo}, ¡Dale un vistazo!`;
    await this.notificacionService.create(notificacion);

    //Send notificacion
    this.socketService.sendToUser(proyect.creador.id, 'Proyecto cargado');

    const updateProyect = await this.update(+id, {
      url: `https://app${id}.proyectos.fireploy.online`,
    } as UpdateProyectoDto);

    //Set repositorios logs
    for (const repositorio of dockerfiles.dockerfiles) {
      //Save log
      await this.logService.create({
        fecha_registro: new Date(Date.now()),
        log: repositorio.log.slice(0, 10000),
        repositorioId: repositorio.repositorioId,
      });
    }
    return updateProyect;
  }

  /**
   * Adds a project to the list of favorites for the authenticated user.
   *
   * @param id - The ID of the project to mark as favorite.
   * @param req - The HTTP request object, used to extract the user's session token.
   * @returns A promise that resolves with the updated project, now including the user in its favorites list.
   *
   * @throws UnauthorizedException if the session token is missing or invalid.
   * @throws NotFoundException if the project or user is not found.
   */
  async puntuarProyecto(id: string, req: Request) {
    //Get project
    const project = await this.findOne(+id);

    //Get User
    const sessionToken = (req.headers as any).sessiontoken;
    const payload = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    //add project to favorites
    const userId = payload.sub;
    const user = await this.usuarioService.findOne(userId, true);
    project.fav_usuarios.push(user);
    await this.update(project.id, project);

    return await this.findOne(+id);
  }

  /**
   * Removes a project from the list of favorites for the authenticated user.
   *
   * @param id - The ID of the project to remove from favorites.
   * @param req - The HTTP request object, used to extract the user's session token.
   * @returns A promise that resolves with the updated project, excluding the user from its favorites list.
   *
   * @throws UnauthorizedException if the session token is missing or invalid.
   * @throws NotFoundException if the project or user is not found.
   */
  async despuntuarProyecto(id: string, req: Request) {
    //Get project
    const project = await this.findOne(+id);

    //Get User
    const sessionToken = (req.headers as any).sessiontoken;
    const payload = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    //add project to favorites
    const userId = payload.sub;
    const user = await this.usuarioService.findOne(userId, true);
    project.fav_usuarios = project.fav_usuarios.filter((u) => u.id !== user.id);
    await this.update(project.id, project);

    return await this.findOne(+id);
  }

  /**
   * Uploads and updates the project's image by its ID.
   *
   * This method renames the incoming image file using a standard naming convention,
   * uploads it to Firebase Storage via the FirebaseService, and updates the project
   * record with the new image URL.
   *
   * Steps performed:
   * 1. Extracts the file extension from the uploaded file.
   * 2. Renames the file to the format: `Project_Image_<projectId>.<ext>`.
   * 3. Uploads the renamed file to Firebase and retrieves its public URL.
   * 4. Updates the project in the database with the new image URL.
   *
   * @param id - The ID of the project whose image will be updated.
   * @param file - The image file uploaded via Multer (Express).
   * @returns A promise resolving to the updated project with the new image URL.
   * @throws NotFoundException if the project with the given ID does not exist.
   */
  async updateImageProject(id: number, file: Express.Multer.File) {
    //Save the image
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo.');
    }
    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `project_images/project_Image_${id}.${fileExtension}`;

    const renamedFile = {
      ...file,
      originalname: newFileName,
    };
    const url = await this.firebaseService.uploadFile(renamedFile);

    //Updateproject info
    const user = await this.update(id, {
      imagen: url,
    } as UpdateProyectoDto);
    return user;
  }

  /**
   * Cambia el estado de ejecución de un proyecto (iniciar o detener).
   *
   * Este método realiza las siguientes acciones:
   * 1. Obtiene el proyecto por su ID.
   * 2. Verifica si el estado actual del proyecto permite el cambio solicitado.
   * 3. Cambia temporalmente el estado a 'L' (cargando) y actualiza en la base de datos.
   * 4. Llama al servicio de cola para ejecutar el cambio de estado real (start o stop).
   * 5. Si se realiza con éxito, actualiza el estado final del proyecto ('N' o 'F').
   *
   * @param id - ID del proyecto a modificar.
   * @param status - Acción a realizar: `"Start"` para iniciar, `"Stop"` para detener.
   * @returns Un mensaje de éxito indicando que el proyecto fue iniciado o detenido.
   *
   * @throws BadRequestException - Si el estado actual del proyecto no permite la acción solicitada
   *                               o si ocurre un error en la cola de procesamiento.
   */
  async changeStatusProyecto(id: string, status: string) {
    //Get project
    const project = await this.findOne(+id);

    //Verify project status
    if (project.estado_ejecucion == 'L')
      throw new BadRequestException('El proyecto se encuentra cargandoo');

    if (project.estado_ejecucion == 'E')
      throw new BadRequestException(
        'El proyecto se encuentra en estado de error, arreglalo antes de intenetar deternerlo o iniciarlo',
      );

    if (project.estado_ejecucion == 'F' && status == 'Stop')
      throw new BadRequestException('El proyecto ya se encuentra detenido');

    if (project.estado_ejecucion == 'N' && status == 'Start')
      throw new BadRequestException('El proyecto ya se encuentra encendido');

    project.estado_ejecucion = 'L';
    await this.update(project.id, project);

    //Add queue
    try {
      await this.projectManagerQueueService.changeStatus({
        project: project,
        action: status,
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
    project.estado_ejecucion = 'N';
    let response = `proyecto ${project.id} ha sido iniciado con exito.`;
    if (status == 'Stop') {
      project.estado_ejecucion = 'F';
      response = `proyecto ${project.id} ha sido detenido con exito.`;
    }

    await this.update(project.id, project);
    return response;
  }
}
