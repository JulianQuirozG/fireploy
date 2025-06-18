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
  
/**
 * Creates and saves a new file entity with its content in the repository.
 *
 * Validates if a file with the same name already exists in the specified repository.
 *
 * @param createFicheroDto - DTO containing file metadata, including the repository ID and file name.
 * @param file - The uploaded file from Multer, containing the content as a buffer.
 * @returns A promise that resolves to the newly created `Fichero` entity.
 * @throws BadRequestException if a file with the same name already exists or another error occurs during creation.
 */
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

 /**
 * Retrieves all file entities from the database, including their associated repository.
 *
 * @returns A promise that resolves to an array of `Fichero` entities.
 */
  async findAll() {
    const fichero = await this.ficheroRepository.find({ relations: ['repositorio'] });
    return fichero;
  }

  /**
 * Finds and returns a file by its unique identifier.
 *
 * @param id - The unique identifier of the file to retrieve.
 * @returns A promise that resolves with the file entity, including its related repository.
 * @throws {BadRequestException} Thrown if no file is found with the specified ID.
 */
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

  /**
 * Deletes a file entity from the database by its ID.
 *
 * First verifies that the file exists using `findOne`, then performs the deletion.
 *
 * @param id - The ID of the file to delete.
 * @returns A promise that resolves to the result of the deletion operation.
 * @throws BadRequestException if the file does not exist.
 */
  async remove(id: number) {
    const fichero = await this.findOne(+id);

    return this.ficheroRepository.delete(+id);
  }
}
