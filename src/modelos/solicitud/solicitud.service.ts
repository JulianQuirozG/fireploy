import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { FilterSolicitudDto } from './dto/filter-solicitud.dto';
import { CursoService } from '../curso/curso.service';
import { Docente } from '../docente/entities/docente.entity';
import { CreateNotificacioneDto } from '../notificaciones/dto/create-notificacione.dto';
import { NotificationsGateway } from 'src/socket/notification.gateway';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { GetSolicitudDto } from './dto/get-solicitud.dto';

@Injectable()
export class SolicitudService {
  constructor(
    private usuarioService: UsuarioService,
    private cursoService: CursoService,
    @InjectRepository(Solicitud)
    private solicitudRepository: Repository<Solicitud>,
    private socketService: NotificationsGateway,
    private notificacionService: NotificacionesService,
  ) {}

  /**
   * Creates a new request (Solicitud) for a user.
   *
   * @param createSolicitudDto - The data transfer object containing the user ID.
   * @returns The created request.
   * @throws NotFoundException if the user does not exist.
   */
  async create(createSolicitudDto: CreateSolicitudDto) {
    const { usuario, cursoId, tipo_solicitud } = createSolicitudDto;
    const user = await this.usuarioService.findOne(usuario, true);

    let solicitud: Solicitud;
    if (tipo_solicitud == 1) {
      solicitud = await this.solicitudRepository.save({
        usuario: user,
        tipo_solicitud: 1,
      });
    } else {
      solicitud = await this.solicitudRepository.save({
        usuario: user,
        tipo_solicitud: 2,
        curso: { id: cursoId },
      });
    }

    return await this.findOne(solicitud.id);
  }

  /**
   * Retrieves all solicitudes based on optional filters.
   *
   * @param filters - Optional filtering criteria, including user ID, request status, type, and course (if applicable).
   * @returns A promise that resolves with an array of filtered and structured request records.
   */
  async findAll(filters?: FilterSolicitudDto) {
    const query = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.usuario', 'usuario')
      .leftJoinAndSelect('solicitud.aprobado_by', 'aprobado_by');

    // Unir curso SOLO si tipo_solicitud es 2
    if (filters?.tipo_solicitud === 2 || !filters?.tipo_solicitud) {
      query.leftJoinAndSelect('solicitud.curso', 'curso');
    }

    query.select([
      'solicitud.id',
      'solicitud.estado',
      'solicitud.fecha_solicitud',
      'solicitud.fecha_respuesta',
      'solicitud.tipo_solicitud',
      'usuario.id',
      'usuario.nombre',
      'aprobado_by.id',
      'aprobado_by.nombre',
    ]);

    if (filters?.tipo_solicitud === 2 || !filters?.tipo_solicitud) {
      query.addSelect('curso.id');
    }

    // Aplicar filtros
    if (filters?.usuario) {
      query.andWhere('usuario.id = :usuarioId', { usuarioId: filters.usuario });
    }

    if (filters?.estado) {
      query.andWhere('solicitud.estado = :estado', { estado: filters.estado });
    }

    if (filters?.tipo_solicitud) {
      query.andWhere('solicitud.tipo_solicitud = :tipo', {
        tipo: filters.tipo_solicitud,
      });
    }

    if (filters?.curso && filters.tipo_solicitud === 2) {
      query.andWhere('curso.id = :cursoId', { cursoId: filters.curso });
    }

    return await query.getMany();
  }

  /**
   * Retrieves a solicitud by its ID, including its related usuario and aprobado_by entities.
   *
   * @param id - The ID of the solicitud to retrieve.
   * @returns The solicitud with its relations.
   * @throws NotFoundException if the solicitud is not found.
   */
  async findOne(id: number) {
    // Obtener la solicitud sin curso
    const query = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.usuario', 'usuario')
      .leftJoinAndSelect('solicitud.aprobado_by', 'aprobado_by')
      .where('solicitud.id = :id', { id })
      .select([
        'solicitud.id',
        'solicitud.estado',
        'solicitud.fecha_solicitud',
        'solicitud.tipo_solicitud',
        'solicitud.fecha_respuesta',
        'solicitud.tipo_solicitud',
        'usuario.id',
        'usuario.nombre',
        'aprobado_by.id',
        'aprobado_by.nombre',
      ]);

    // Verificar si la solicitud es tipo 2 antes de unir `curso`
    const solicitud = await query.getOne();
    if (!solicitud) {
      throw new NotFoundException(
        `La solicitud con el id ${id} no se encuentra en la base de datos.`,
      );
    }

    if (solicitud.tipo_solicitud === 2) {
      const queryCurso = this.solicitudRepository
        .createQueryBuilder('solicitud')
        .leftJoinAndSelect('solicitud.curso', 'curso')
        .where('solicitud.id = :id', { id })
        .addSelect('curso.id');

      const solicitudConCurso = await queryCurso.getOne();
      return { ...solicitud, curso: solicitudConCurso?.curso };
    }

    return solicitud;
  }

    /**
   * Retrieves a solicitud by its user ID, including its related usuario and aprobado_by entities.
   *
   * @param id - The ID of the solicitud to retrieve.
   * @returns The solicitud with its relations.
   * @throws NotFoundException if the solicitud is not found.
   */
  async findOneSolicitudByUser(getSolicitudDto: GetSolicitudDto) {

    const {id, tipo} = getSolicitudDto;
    // Obtener la solicitud sin curso
    const query = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.usuario', 'usuario')
      .leftJoinAndSelect('solicitud.aprobado_by', 'aprobado_by')
      .leftJoinAndSelect('solicitud.curso', 'curso')
      .where('usuario.id = :id', { id })
      .andWhere('solicitud.tipo_solicitud = :tipo', { tipo })
      .select([
        'solicitud.id',
        'solicitud.estado',
        'solicitud.fecha_solicitud',
        'solicitud.tipo_solicitud',
        'solicitud.fecha_respuesta',
        'solicitud.tipo_solicitud',
        'usuario.id',
        'usuario.nombre',
        'aprobado_by.id',
        'aprobado_by.nombre',
        'curso.id'
      ]);

    // Verificar si la solicitud es tipo 2 antes de unir `curso`
    const solicitud = await query.getMany();
    if (!solicitud) {
      throw new NotFoundException(
        `El usuario con el id ${id} no se cuenta con solicitudes, de tipo ${tipo}.`,
      );
    }

    return solicitud;
  }

  /**
   * Updates a solicitud by its ID.
   *
   * @param id - The ID of the solicitud to update.
   * @param updateSolicitudDto - The data to update the solicitud with.
   * @returns The updated solicitud.
   */
  async update(id: number, updateSolicitudDto: UpdateSolicitudDto) {
    //verify solicitud exists
    let solicitud = await this.findOne(id);

    if (solicitud.estado != process.env.IN_WAIT_STATE_SOLICITUD) {
      throw new NotFoundException(
        `La solicitud con el id ${id}, ya se encuentra cerrada, aprobada o rechazada`,
      );
    }

    //set notificacion
    const notificacion: CreateNotificacioneDto = {
      titulo: ``,
      mensaje: '',
      tipo: 2,
      fecha_creacion: new Date(Date.now()),
      visto: false,
      usuario: solicitud.usuario,
    };

    //verify user apporoved exists
    const user_approver = await this.usuarioService.findOne(
      updateSolicitudDto.aprobado_by,
      true,
    );

    //Update solicitud
    solicitud = await this.solicitudRepository.save({
      id: id,
      fecha_respuesta: new Date(),
      estado: updateSolicitudDto.estado,
      aprobado_by: user_approver,
    });
    const response = await this.findOne(solicitud.id);

    //update
    if (response.tipo_solicitud == 1) {
      //Set notificacion
      notificacion.titulo = `Solicitud docente aceptada`;
      notificacion.mensaje = `Tu solicitud para ser un docente de la plataforma fireploy ha sido aceptada.`;

      if (response.estado == 'R') {
        notificacion.titulo = `Solicitud docente rechazada`;
        notificacion.mensaje = `Lo sentimos, tu solicitud para ser docente de la plataforma fireploy ha sido rechazada.`;
      } else {
        //Update user State
        const user = response.usuario;
        user.tipo = 'Docente';
        await this.usuarioService.update(user.id, user);
      }
    } else {
      //find curso
      const curso = await this.cursoService.findOne(
        response.curso?.id as string,
      );

      //Set notificacion
      notificacion.titulo = `Solicitud docente de curso aceptada`;
      notificacion.mensaje = `Tu solicitud para ser el docente tutor del curso "${curso.materia.nombre} - ${curso.id}" ha sido aceptada.`;

      if (response.estado == 'R') {
        notificacion.titulo = `Solicitud docente de curso rechazada`;
        notificacion.mensaje = `Lo sentimos, tu solicitud para ser el docente tutor del curso "${curso.materia.nombre} - ${curso.id}" ha sido rechazada.`;
      } else {
        //Eliminate another solicitudes
        const solicitudesRelacionadas = await this.findAll({
          tipo_solicitud: 2,
          curso: response.curso?.id,
          estado: process.env.IN_WAIT_STATE_SOLICITUD,
        });
        if (solicitudesRelacionadas.length > 0) {
          for (const solicitud of solicitudesRelacionadas) {
            solicitud.estado = 'R';
            solicitud.fecha_respuesta = new Date();
            solicitud.aprobado_by = user_approver;

            //set rejected notificaciones
            const rejected_notificacicon: CreateNotificacioneDto = {
              titulo: `Solicitud docente de curso rechazada`,
              mensaje: `Lo sentimos, tu solicitud para ser el docente tutor del curso "${curso.materia.nombre} - ${curso.id}" ha sido rechazada.`,
              tipo: 2,
              fecha_creacion: new Date(Date.now()),
              visto: false,
              usuario: solicitud.usuario,
            };

            //save notificacion
            await this.notificacionService.create(rejected_notificacicon);

            //Send notificacion
            this.socketService.sendToUser(
              solicitud.usuario.id,
              'Solicitud respondida',
            );
          }
          await this.solicitudRepository.save(solicitudesRelacionadas);
        }

        //Update docente curso
        const user = response.usuario;
        curso.docente = user.id as unknown as Docente;
        await this.cursoService.update(curso.id, curso);
      }
    }

    //save notificacion
    await this.notificacionService.create(notificacion);

    //Send notificacion
    this.socketService.sendToUser(
      notificacion.usuario.id,
      'Solicitud respondida',
    );
    return response;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitud`;
  }
}
