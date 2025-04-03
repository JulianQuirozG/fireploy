import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { FilterSolicitudDto } from './dto/filter-solicitud.dto';

@Injectable()
export class SolicitudService {
  constructor(
    private usuarioService: UsuarioService,
    @InjectRepository(Solicitud)
    private solicitudRepository: Repository<Solicitud>,
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

  // Return a solicitud filter list
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
      console.log(1);
      return { ...solicitud, curso: solicitudConCurso?.curso };
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
    const solicitud = await this.findOne(id);

    if (solicitud.estado != process.env.IN_WAIT_STATE_SOLICITUD) {
      throw new NotFoundException(
        `La solicitud con el id ${id}, ya se encuentra cerrada, aprobada o rechazada`,
      );
    }

    //verify user apporoved exists
    const user_approver = await this.usuarioService.findOne(
      updateSolicitudDto.aprobado_by,
      true,
    );

    //Update solicitud
    const solcitud = await this.solicitudRepository.save({
      id: id,
      fecha_respuesta: new Date(),
      estado: updateSolicitudDto.estado,
      aprobado_by: user_approver,
    });

    const response = await this.findOne(solcitud.id);

    //Update user State
    const user = response.usuario;
    if (response.estado == process.env.APPROVED_STATE_SOLICITUD) {
      user.tipo = 'Docente';
      await this.usuarioService.update(user.id, user);
    }
    return response;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitud`;
  }
}
