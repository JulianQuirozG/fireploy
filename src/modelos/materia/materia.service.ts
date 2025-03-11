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
import * as xlsx from 'xlsx';

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
    return await this.materiaRepository.find({
      relations: ['cursos'],
    });
  }

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

  async update(id: number, updateMateriaDto: UpdateMateriaDto) {
    await this.findOne(id);
    await this.materiaRepository.update(id, updateMateriaDto);
    return await this.findOne(id);
  }

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
    //Verify file exits
    if (!file) {
      throw new BadRequestException('No se ha cargado ningún archivo');
    }

    //Verify file extension
    if (
      !(process.env.ALLOWED_MIME_TYPES as unknown as string[]).includes(
        file.mimetype,
      )
    ) {
      throw new Error('El archivo debe ser un Excel (.xls o .xlsx)');
    }

    // read the file content
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const materias = plainToInstance(CreateMateriaDto, data);
    const errors: any[] = [];

    for (const materia of materias) {
      const errores = await validate(materia);
      if (errores.length > 0) errors.push(errores);
    }

    if (errors.length > 0)
      return { mensaje: 'Alguna de las materias no se logró cargar', errors };

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

    if (errors.length > 0)
      return { mensaje: 'Alguna de las materias no se pudo cargar', errors };
    else {
      return { mensaje: 'Materias cargadas con exito' };
    }
  }
}
