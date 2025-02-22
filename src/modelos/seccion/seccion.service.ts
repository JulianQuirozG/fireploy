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

  findAll() {
    return `This action returns all seccion`;
  }

  //get a seccion by id
  async findOne(id: number) {
    const seccion = await this.seccionRepository.findOne({
      where: { id: id },
      relations: ['curso'],
    });
    if (!seccion) {
      throw new NotFoundException(
        `La seccion con el id ${id} no se encuentra registrada.`,
      );
    }
    return seccion;
  }

  update(id: number, updateSeccionDto: UpdateSeccionDto) {
    return `This action updates a #${id} seccion`;
  }

  remove(id: number) {
    return `This action removes a #${id} seccion`;
  }
}
