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
      .where('usuario.id = :id', { userId })
      .getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} notificacione`;
  }

  update(id: number, updateNotificacioneDto: UpdateNotificacioneDto) {
    return `This action updates a #${id} notificacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificacione`;
  }
}
