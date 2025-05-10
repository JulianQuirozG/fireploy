import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { Materia } from './entities/materia.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Workbook } from 'exceljs';

@Injectable()
export class MateriaService {
  constructor(
    @InjectRepository(Materia)
    private materiaRepository: Repository<Materia>,
  ) {}

  /**
   * Creates and saves a new materia in the database if it doesn't already exist.
   *
   * @param createMateriaDto - An object containing the data required to create a new subject.
   * @returns A promise that resolves with the saved subject.
   * @throws ConflictException if a subject with the same name and active status already exists.
   */
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

  /**
   * Retrieves all subjects materias from the database, including their related courses.
   *
   * @returns A promise that resolves with an array of subjects, each with their associated courses.
   */
  async findAll() {
    return await this.materiaRepository.find({
      relations: ['cursos'],
    });
  }

  /**
   * Retrieves a single subject (materia) by its ID, including its related courses.
   *
   * @param id - The ID of the subject to retrieve.
   * @returns A promise that resolves with the subject object if found, including its related courses.
   * @throws NotFoundException if no subject is found with the given ID.
   */
  async findOne(id: number) {
    const materia = await this.materiaRepository.findOne({
      where: { id: id },
      relations: ['cursos'],
    });
    if (!materia) {
      throw new NotFoundException(`La materia con el id ${id} no existe`);
    }
    return materia;
  }

  /**
   * Updates an existing subject materia with the provided data.
   *
   * @param id - The ID of the subject to update.
   * @param updateMateriaDto - An object containing the updated data for the subject.
   * @returns A promise that resolves with the updated subject.
   * @throws NotFoundException if no subject is found with the given ID.
   */
  async update(id: number, updateMateriaDto: UpdateMateriaDto) {
    await this.findOne(id);
    await this.materiaRepository.update(id, updateMateriaDto);
    return await this.findOne(id);
  }

  /**
   * Deletes a materia by its ID.
   *
   * @param id - The ID of the subject to delete.
   * @returns A promise that resolves with the result of the delete operation.
   * @throws NotFoundException if no subject is found with the given ID.
   */
  async remove(id: number) {
    await this.findOne(id);
    return await this.materiaRepository.delete(id);
  }

  /**
   **
   * Uploads a list of subjects from an Excel file and stores them in the database.
   *
   * @param file The uploaded Excel file containing the subjects.
   * @returns An object indicating whether the subjects were successfully uploaded or if there were errors.
   *
   * @throws BadRequestException If no file is uploaded.
   * @throws Error If the file is not a valid Excel file (.xls or .xlsx).
   */
  async UploadMaterias(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha cargado ningún archivo');
    }

    if (
      !(process.env.ALLOWED_MIME_TYPES as unknown as string[]).includes(
        file.mimetype,
      )
    ) {
      throw new Error('El archivo debe ser un Excel (.xls o .xlsx)');
    }

    // Leer el archivo con exceljs
    const workbook = new Workbook();
    const buffer = new Uint8Array(file.buffer).buffer;
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    // Obtener encabezados
    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      headers.push(String(cell.value ?? ''));
    });

    // Convertir filas a objetos
    const data: Record<string, any>[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Saltar encabezado
      const rowData: Record<string, any> = {};
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.value;
      });
      data.push(rowData);
    });

    // Transformar y validar
    const materias = plainToInstance(CreateMateriaDto, data);
    const errors: any[] = [];

    for (const materia of materias) {
      const errores = await validate(materia);
      if (errores.length > 0) errors.push(errores);
    }

    if (errors.length > 0) {
      return {
        mensaje: 'Alguna de las materias no se logró cargar',
        errors,
      };
    }

    for (const materia of materias) {
      try {
        await this.create(materia);
      } catch (error) {
        errors.push({
          tittle: `La materia con nombre ${materia.nombre} no se pudo registrar`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message: error.message,
        });
      }
    }

    if (errors.length > 0) {
      return {
        mensaje: 'Alguna de las materias no se pudo cargar',
        errors,
      };
    } else {
      return {
        mensaje: 'Materias cargadas con éxito',
      };
    }
  }
}
