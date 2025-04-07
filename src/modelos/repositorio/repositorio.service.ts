import {
  BadRequestException,
  forwardRef,
  Inject,
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
import { stringify } from 'querystring';
import { VariablesDeEntorno } from 'src/interfaces/variables_entorno.interface';
import { concat } from 'rxjs';

@Injectable()
export class RepositorioService {
  constructor(
    @InjectRepository(Repositorio)
    private repositorioRepository: Repository<Repositorio>,
    @Inject(forwardRef(() => ProyectoService))
    private proyectoRepository: ProyectoService,
  ) { }
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

    if(createRepositorioDto.variables_de_entorno && createRepositorioDto.variables_de_entorno.length>0){
      nuevorepositorio.variables_de_entorno = createRepositorioDto.variables_de_entorno.map((variable_entorno: VariablesDeEntorno)=>{
        return variable_entorno.clave+`=`+variable_entorno.valor; 
      }).join('\n');
    }

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
    let repo = await this.findOne(id);
    updateRepositorioDto.id = repo.id;
    //update repository
    if(updateRepositorioDto.variables_de_entorno && updateRepositorioDto.variables_de_entorno.length>0){
      repo.variables_de_entorno = updateRepositorioDto.variables_de_entorno.map((variable_entorno: VariablesDeEntorno)=>{
        return variable_entorno.clave+`=`+variable_entorno.valor; 
      }).join('\n');
    }
    const { variables_de_entorno, ...restoDto } = updateRepositorioDto;
    
    repo = {
      ...repo,
      ...restoDto,
    };

    await this.repositorioRepository.save(repo);
    return this.findOne(id);
  }

  async remove(id: number) {
    const repository = await this.findOne(id);
    await this.repositorioRepository.delete(repository.id)
    return `repositorio con el #${id} ha sido eliminado, con referencia al proyecto ${repository.proyecto_id} ha sido elimnado correctamente`;
  }
}
