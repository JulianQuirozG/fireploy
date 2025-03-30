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
      version: createRepositorioDto.version,
      url: createRepositorioDto.url,
      tipo: createRepositorioDto.tipo,
      tecnologia: createRepositorioDto.tecnologia,
      proyecto_id: proyecto,
    });
    await this.repositorioRepository.save(nuevorepositorio);

    return await this.findOne(nuevorepositorio.id);
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
      relations: ['proyecto_id'],
    });
    if (!repo) {
      throw new NotFoundException(`El repositorio con el id: ${id}, no existe`);
    }
    return repo;
  }

  async update(id: number, updateRepositorioDto: UpdateRepositorioDto) {
    //Verify repositorio exists
    const repo = await this.findOne(id);
    updateRepositorioDto.id = repo.id;
    //update repository
    await this.repositorioRepository.save(updateRepositorioDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} repositorio`;
  }
}
