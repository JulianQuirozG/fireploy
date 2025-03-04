import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRepositorioDto } from './dto/create-repositorio.dto';
import { UpdateRepositorioDto } from './dto/update-repositorio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repositorio } from './entities/repositorio.entity';
import { Repository } from 'typeorm';
import { FilterRepositorioDto } from './dto/filter-repositorio.dto';
import { ProyectoService } from '../proyecto/proyecto.service';
import { Proyecto } from '../proyecto/entities/proyecto.entity';

@Injectable()
export class RepositorioService {
  constructor(
    @InjectRepository(Repositorio)
    private repositorioRepository: Repository<Repositorio>,
    private proyectoRepository: ProyectoService,
  ) {}
  async create(createRepositorioDto: CreateRepositorioDto) {
    const proyecto = await this.proyectoRepository.findOne(
      +createRepositorioDto.proyecto_id,
    );
    if (!proyecto) {
      throw new BadRequestException(
        `El proyecto con el id, ${createRepositorioDto.proyecto_id} no existe`,
      );
    }
    const nuevorepositorio = this.repositorioRepository.create({
      version: createRepositorioDto.url,
      url: createRepositorioDto.url,
      tipo: createRepositorioDto.tipo,
      tecnologia: createRepositorioDto.tecnologia,
      proyecto_id: proyecto,
    });
    return this.repositorioRepository.save(nuevorepositorio);
  }

  async findAll(filters?: FilterRepositorioDto) {
    if (filters) {
      const { proyecto_id } = filters;
      const proyectoId_id = proyecto_id as unknown as number;

      if (proyectoId_id) {
        const exist = await this.proyectoRepository.findOne(proyectoId_id);

        if (!exist)
          throw new BadRequestException(
            `El repositorio con id ${proyectoId_id} No existe`,
          );

        filters.proyecto_id = exist;
      }
    }
    return await this.repositorioRepository.find({
      where: filters,
      relations: ['proyecto_id'],
    });
  }

  async findOne(id: number) {
    const repo = await this.repositorioRepository.findOne({
      where: { id: id },
    });
    if (!repo) {
      throw new NotFoundException(`El repositorio con el id: ${id}, no existe`);
    }
    return repo;
  }

  async update(id: number, updateRepositorioDto: UpdateRepositorioDto) {
    const repo = await this.findOne(id);
    let projec;
    if (updateRepositorioDto.proyecto_id) {
      const project = await this.proyectoRepository.findOne(
        +updateRepositorioDto.proyecto_id,
      );
      projec = project;
    }
    updateRepositorioDto.id = repo.id;
    updateRepositorioDto.proyecto_id = projec as Proyecto;
    await this.repositorioRepository.save(updateRepositorioDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} repositorio`;
  }
}
