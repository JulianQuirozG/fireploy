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
    const { usuario } = createSolicitudDto;
    const user = await this.usuarioService.findOne(usuario);

    if (!user)
      throw new NotFoundException(`El usuario con el id ${usuario} no existe`);

    const solicitud = this.solicitudRepository.save({
      usuario: user,
    });

    return solicitud;
  }

  // Return a solicitud filter list
  async findAll(filters?: FilterSolicitudDto) {
    const query = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.usuario', 'usuario')
      .leftJoinAndSelect('solicitud.aprobado_by', 'aprobado_by')
      .select([
        'solicitud.id',
        'solicitud.estado',
        'solicitud.fecha_solicitud',
        'solicitud.fecha_respuesta',
        'usuario.id',
        'usuario.nombre',
        'aprobado_by.id',
        'aprobado_by.nombre',
      ]);

    if (filters?.usuario) {
      query.andWhere('usuario.id = :usuarioId', { usuarioId: filters.usuario });
    }

    if (filters?.estado) {
      query.andWhere('solicitud.estado = :estado', { estado: filters.estado });
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
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: id },
      relations: ['usuario', 'aprobado_by'],
    });

    if (!solicitud)
      throw new NotFoundException(
        `La solicitud con el id ${id} no se encuentra en la base de datos.`,
      );

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
    );

    //Update solicitud
    let response = await this.solicitudRepository.save({
      id: id,
      fecha_respuesta: new Date(),
      estado: updateSolicitudDto.estado,
      aprobado_by: user_approver,
    });

    response = await this.findOne(response.id);

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
