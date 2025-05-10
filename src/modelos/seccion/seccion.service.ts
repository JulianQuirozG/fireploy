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

  /**
   * Creates a new section and associates it with an existing course.
   *
   * @param createSeccionDto - An object containing the section details, including start/end dates and course ID.
   * @returns A promise that resolves with the newly created section.
   *
   * @throws BadRequestException if the course does not exist or the start date is after the end date.
   */
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

  /**
   * Retrieves all sections, optionally filtered by course.
   *
   * @param filters - Optional filtering criteria, such as the course ID.
   * @returns A promise that resolves with an array of sections, each including their related projects and course.
   *
   * @throws BadRequestException if the specified course does not exist.
   */
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

  /**
   * Retrieves a single section by its ID.
   *
   * @param id - The ID of the section to retrieve.
   * @returns A promise that resolves with the section if found, including its related entities.
   *
   * @throws NotFoundException if no section exists with the specified ID.
   */
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

  /**
   * Updates an existing section with the provided data.
   *
   * @param id - The ID of the section to update.
   * @param updateSeccionDto - An object containing the updated fields for the section.
   * @returns A promise that resolves with the updated section.
   *
   * @throws NotFoundException if the section with the given ID does not exist.
   * @throws BadRequestException if the provided dates are inconsistent or invalid.
   */
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
