import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFicheroDto } from './dto/create-fichero.dto';
import { UpdateFicheroDto } from './dto/update-fichero.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Fichero } from './entities/fichero.entity';
import { Repository } from 'typeorm';
import { RepositorioService } from '../repositorio/repositorio.service';
import e from 'express';

@Injectable()
export class FicherosService {
  constructor(
    @InjectRepository(Fichero)
    private readonly ficheroRepository: Repository<Fichero>,
    private readonly repositorioService: RepositorioService) { }

  async create(createFicheroDto: CreateFicheroDto, file: Express.Multer.File): Promise<Fichero> {
    try {
      const repositorio = await this.repositorioService.findOne(+createFicheroDto.repositorio);
      const duplicate = await this.ficheroRepository.findOne({ where: { nombre: createFicheroDto.nombre, repositorio: repositorio } })
      if(duplicate)
        throw new Error(`El archivo con el nombre: ${createFicheroDto.nombre}, ya existe en la lista de ficheros de tu respositorio`)
      const fichero = this.ficheroRepository.create({ nombre: createFicheroDto.nombre, contenido: file.buffer, repositorio: repositorio });
      return await this.ficheroRepository.save(fichero);
    }
    catch (error) {
      throw new BadRequestException(error.message)
    }

  }

  async findAll() {
    const fichero = await this.ficheroRepository.find({ relations: ['repositorio'] });
    return fichero;
  }

  async findOne(id: number) {
    const fichero = await this.ficheroRepository.findOne({
      where: { id: id },
      relations: ['repositorio']
    });

    if (!fichero)
      throw new BadRequestException(`el fichero con el id: ${id}, no existe`)
    return fichero;
  }

  update(id: number, updateFicheroDto: UpdateFicheroDto) {
    return `This action updates a #${id} fichero`;
  }

  async remove(id: number) {
    const fichero = await this.findOne(+id);

    return this.ficheroRepository.delete(+id);
  }
}
