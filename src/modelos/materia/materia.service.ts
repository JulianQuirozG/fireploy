import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { Materia } from './entities/materia.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MateriaService {
  constructor(
    @InjectRepository(Materia)
    private materiaRepository: Repository<Materia>,
  ) {}
  async create(createMateriaDto: CreateMateriaDto) {
    const materia = await this.materiaRepository.findOne({
      where: {
        nombre: createMateriaDto.nombre,
        estado: `A`,
      },
    });
    if (materia) {
      throw new ConflictException(
        `La materia con nombre ${createMateriaDto.nombre}, ya existe`,
      );
    }
    return await this.materiaRepository.save(createMateriaDto);
  }

  async findAll() {
    return await this.materiaRepository.find();
  }

  async findOne(id: number) {
    const materia = await this.materiaRepository.findOne({
      where: { id: id },
    });
    if (!materia) {
      throw new NotFoundException();
    }
    return materia;
  }

  async update(id: number, updateMateriaDto: UpdateMateriaDto) {
    await this.findOne(id);
    await this.materiaRepository.update(id, updateMateriaDto);
    return await this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} materia`;
  }
}
