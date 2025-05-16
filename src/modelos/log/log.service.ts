import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Log } from './entities/log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositorioService } from '../repositorio/repositorio.service';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    private repositorioService: RepositorioService,
  ) {}

  async create(createLogDto: CreateLogDto) {
    //get repositorio
    console.log(createLogDto);
    const repositorio = await this.repositorioService.findOne(
      +createLogDto.repositorioId,
    );

    //check repositorio exits
    if (!repositorio) {
      throw new NotFoundException(
        `El repositorio con el id ${createLogDto.repositorioId} no se encuentra registrado.`,
      );
    }
    //save log
    const log = this.logRepository.create();
    log.fecha_registro = createLogDto.fecha_registro;
    log.log = createLogDto.log;
    log.repositorio = repositorio;
    return await this.logRepository.save(log);
  }

  findAll() {
    return `This action returns all log`;
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }
}
