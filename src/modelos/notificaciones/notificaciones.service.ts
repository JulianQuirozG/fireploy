import { Injectable } from '@nestjs/common';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';
import { Notificacione } from './entities/notificacione.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacione)
    private notificacionesRepository: Repository<Notificacione>,
  ) {}

  async create(createNotificacioneDto: CreateNotificacioneDto) {
    return await this.notificacionesRepository.save(createNotificacioneDto);
  }

  async findAllByUser(userId: number) {
    return await this.notificacionesRepository
      .createQueryBuilder('notificacione')
      .leftJoin('notificacione.usuario', 'usuario')

      .addSelect(['usuario.id', 'usuario.nombre'])
      .where('usuario.id = :userId', { userId })
      .getMany();
  }

  async findOne(id: number) {
    return await this.notificacionesRepository
      .createQueryBuilder('notificacione')
      .leftJoin('notificacione.usuario', 'usuario')

      .addSelect(['usuario.id', 'usuario.nombre'])
      .where('notificacione.id = :id', { id })
      .getMany();
  }

  async update(id: number) {
    const notificacion = await this.findOne(id);
    notificacion[0].visto = true;
    return await this.notificacionesRepository.save(notificacion);
  }

  remove(id: number) {
    return `This action removes a #${id} notificacione`;
  }
}
