import { Injectable } from '@nestjs/common';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { Notificacione } from './entities/notificacione.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacione)
    private notificacionesRepository: Repository<Notificacione>,
  ) {}
  /**
 * Creates and saves a new notification in the database.
 *
 * @param createNotificacioneDto - The data transfer object containing notification details.
 * @returns A promise that resolves with the saved notification entity.
 */
  async create(createNotificacioneDto: CreateNotificacioneDto) {
    return await this.notificacionesRepository.save(createNotificacioneDto);
  }

  /**
 * Retrieves all notifications associated with a specific user.
 *
 * @param userId - The ID of the user whose notifications will be retrieved.
 * @returns A promise that resolves with an array of notifications linked to the given user.
 */
  async findAllByUser(userId: number) {
    return await this.notificacionesRepository
      .createQueryBuilder('notificacione')
      .leftJoin('notificacione.usuario', 'usuario')

      .addSelect(['usuario.id', 'usuario.nombre'])
      .where('usuario.id = :userId', { userId })
      .getMany();
  }

  /**
 * Retrieves a specific notification by its ID, including basic user information.
 *
 * @param id - The unique identifier of the notification to retrieve.
 * @returns A promise that resolves with an array containing the notification and associated user data.
 */
  async findOne(id: number) {
    return await this.notificacionesRepository
      .createQueryBuilder('notificacione')
      .leftJoin('notificacione.usuario', 'usuario')

      .addSelect(['usuario.id', 'usuario.nombre'])
      .where('notificacione.id = :id', { id })
      .getMany();
  }

  /**
 * Marks a specific notification as seen by setting its 'visto' property to true.
 *
 * @param id - The unique identifier of the notification to update.
 * @returns A promise that resolves with the updated notification.
 * @throws {NotFoundException} If the notification with the given ID does not exist.
 */
  async update(id: number) {
    const notificacion = await this.findOne(id);
    notificacion[0].visto = true;
    return await this.notificacionesRepository.save(notificacion);
  }

  remove(id: number) {
    return `This action removes a #${id} notificacione`;
  }
}
