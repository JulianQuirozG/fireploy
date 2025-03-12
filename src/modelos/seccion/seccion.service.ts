import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { UpdateSeccionDto } from './dto/update-seccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seccion } from './entities/seccion.entity';
import { CursoService } from '../curso/curso.service';
import { FilterSeccionDto } from './dto/filter-seccion.dto';

@Injectable()
export class SeccionService {
  constructor(
    @InjectRepository(Seccion)
    private seccionRepository: Repository<Seccion>,
    private cursoService: CursoService,
  ) {}

  //Create a curso seccion
  async create(createSeccionDto: CreateSeccionDto) {
    const { fecha_inicio, fecha_fin, cursoId } = createSeccionDto;

    //Verify curso dates
    if (fecha_inicio > fecha_fin)
      throw new BadRequestException(
        `La fecha de inicio del curso no puede ser despues de la fecha fin.`,
      );

    //Verify curso exists
    const curso = await this.cursoService.findOne(cursoId);
    if (!curso)
      throw new BadRequestException(`El curso con id ${cursoId} No existe`);

    //save new Seccion
    const seccion = this.seccionRepository.save({ ...createSeccionDto, curso });
    return seccion;
  }

  //Return a seccion filter list
  async findAll(filters?: FilterSeccionDto) {
    if (filters) {
      const { curso } = filters;
      const curso_id = curso as unknown as string;

      //verify curso exists
      if (curso_id) {
        const exist = await this.cursoService.findOne(curso_id);

        if (!exist)
          throw new BadRequestException(
            `El curso con id ${curso_id} No existe`,
          );

        filters.curso = exist;
      }
    }
    return await this.seccionRepository.find({
      where: filters,
      relations: ['proyectos', 'curso'],
    });
  }

  //get a seccion by id
  async findOne(id: number) {
    const seccion = await this.seccionRepository.findOne({
      where: { id: id },
      relations: ['proyectos', 'curso'],
    });
    if (!seccion) {
      throw new NotFoundException(
        `La seccion con el id ${id} no se encuentra registrada.`,
      );
    }
    return seccion;
  }

  //Update a seccion info
  async update(id: number, updateSeccionDto: UpdateSeccionDto) {
    const seccion: Seccion = await this.findOne(id);
    const { fecha_inicio, fecha_fin } = updateSeccionDto;
    //Verify seccion exists
    if (!seccion) {
      throw new NotFoundException(
        `La seccion con el id ${id} no se encuentra registrada.`,
      );
    }

    //Verify curso dates
    if (fecha_inicio && fecha_fin) {
      if (fecha_inicio > fecha_fin)
        throw new BadRequestException(
          `La fecha de inicio del curso no puede ser despues de la fecha fin.`,
        );
    } else {
      if (fecha_inicio && new Date(fecha_inicio) > seccion.fecha_fin)
        throw new BadRequestException(
          `La nueva fecha de inicio no puede ser despues que la actual fecha de fin`,
        );

      if (fecha_fin && new Date(fecha_fin) > seccion.fecha_inicio)
        throw new BadRequestException(
          `La nueva fecha de fin no puede ser antes que la actual fecha de inicio`,
        );
    }

    //Update seccion info
    await this.seccionRepository.save({ id, ...updateSeccionDto });

    //Return updated user
    return await this.findOne(id);
  }

  async remove(id: number) {}
}
