/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBaseDeDatoDto } from './dto/create-base_de_dato.dto';
import { UpdateBaseDeDatoDto } from './dto/update-base_de_dato.dto';
import { BaseDeDato } from './entities/base_de_dato.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
//import { DockerfileService } from 'src/services/docker.service';
import { ProyectoService } from '../proyecto/proyecto.service';
import { FilterBaseDeDatoDto } from './dto/filter-base_de_dato.dto';
import { SystemQueueService } from 'src/Queue/Services/system.service';

@Injectable()
export class BaseDeDatosService {
  constructor(
    @InjectRepository(BaseDeDato)
    private baseDeDatosRepository: Repository<BaseDeDato>,
    //private dockerfileService: DockerfileService,
    @Inject(forwardRef(() => ProyectoService))
    private proyectoService: ProyectoService,
    private systemQueueService: SystemQueueService,
  ) { }

  /**
   * Creates a new database entity, associates it with a project.
  
   * @param createBaseDeDatoDto - Data transfer object containing the required information
   * for creating the database, including its name, type, credentials, and associated project ID.
   *
   * @returns The newly created and persisted database entity.
   *
   * @throws {NotFoundException} If a database with the same name already exists or if an error
   * occurs during the database deployment process.
   */
  async create(createBaseDeDatoDto: CreateBaseDeDatoDto) {
    //save new Base de datos
    let baseDeDatos: CreateBaseDeDatoDto & BaseDeDato;
    try {
      baseDeDatos = await this.baseDeDatosRepository.save({
        ...createBaseDeDatoDto,
        usuario: createBaseDeDatoDto.nombre,
      });
    } catch (error) {
      throw new NotFoundException(
        `Ya existe una base de datos con ese nombre ${error}`,
      );
    }

    //assign database to proyect
    const project = await this.proyectoService.findOne(
      createBaseDeDatoDto.proyecto_id,
    );
    project.base_de_datos = baseDeDatos;

    await this.proyectoService.update(createBaseDeDatoDto.proyecto_id, project);

    //Build DB in DB image
    try {
      //Verify DB Type
      let containerName = process.env.MYSQL_CONTAINER_NAME as string;
      if (createBaseDeDatoDto.tipo == process.env.NO_SQL_DB)
        containerName = process.env.MONGO_CONTAINER_NAME as string;
      else if (createBaseDeDatoDto.tipo == process.env.POST_DB)
        containerName = process.env.POSTGRES_CONTAINER_NAME as string;
      else if (createBaseDeDatoDto.tipo == process.env.MARIA_DB)
        containerName = process.env.MARIADB_CONTAINER_NAME as string;


      const connection_URI = await this.systemQueueService.enqueSystem({
        containerName: containerName,
        nombre: baseDeDatos.nombre,
        usuario: baseDeDatos.usuario,
        contrasenia: createBaseDeDatoDto.contrasenia,
        type: createBaseDeDatoDto.tipo,
      });
      baseDeDatos.url = connection_URI;
      await this.update(baseDeDatos.id, baseDeDatos);
    } catch (error) {
      throw new NotFoundException(`Error al generar la base de datos ${error}`);
    }

    return await this.findOne(baseDeDatos.id);
  }

  /**
   * Retrieves a list of database records from the system, optionally filtered
   * by name and type.
   *
   * This method uses a dynamic query builder to fetch database entries. If filters
   * are provided, it will narrow the results accordingly:
   * - `nombre`: Filters databases by exact name.
   * - `tipo`: Filters databases by type (e.g., MySQL, PostgreSQL).
   *
   * @param filters - Object containing optional filter criteria such as `nombre` and `tipo`.
   *
   * @returns A list of database entities that match the given filters.
   */
  async findAll(filters: FilterBaseDeDatoDto) {
    const query =
      this.baseDeDatosRepository.createQueryBuilder('base_de_datos');

    query.select([
      'base_de_datos.id',
      'base_de_datos.nombre',
      'base_de_datos.usuario',
      'base_de_datos.tipo',
      'base_de_datos.contrasenia',
    ]);

    // Aplicar filtros
    if (filters?.nombre) {
      query.andWhere('base_de_datos.nombre = :nombre', {
        nombre: filters.nombre,
      });
    }

    if (filters?.tipo) {
      query.andWhere('base_de_datos.tipo = :tipo', { tipo: filters.tipo });
    }

    return await query.getMany();
  }

  /**
   * Retrieves a single database entity by its ID, including its associated project relation.
   *
   * If the database with the specified ID does not exist, a NotFoundException is thrown.
   *
   * @param id - The unique identifier of the database to retrieve.
   *
   * @returns The database entity along with its associated project.
   *
   * @throws {NotFoundException} If no database is found with the provided ID.
   */
  async findOne(id: number) {
    const baseDeDatos = await this.baseDeDatosRepository.findOne({
      where: { id: id },
      relations: ['proyecto'],
    });

    if (!baseDeDatos) {
      throw new NotFoundException(
        `No se ha encontrado una base de datos con id ${id}`,
      );
    }

    return baseDeDatos;
  }

  /**
   * Updates an existing database entity with the provided data.
   *
   * This method first verifies the existence of the database by its ID.
   * If found, it applies the updates and returns the updated record.
   *
   * @param id - The unique identifier of the database to update.
   * @param updateBaseDeDatoDto - Data transfer object containing the updated fields.
   *
   * @returns The updated database entity.
   *
   * @throws {NotFoundException} If no database is found with the provided ID.
   */
  async update(id: number, updateBaseDeDatoDto: UpdateBaseDeDatoDto) {
    //Verify exists data base
    const baseDeDatos = await this.findOne(id);

    if (!baseDeDatos) {
      throw new NotFoundException(
        `No se ha encontrado una base de datos con id ${id}`,
      );
    }

    await this.baseDeDatosRepository.save({ id, ...updateBaseDeDatoDto });
    return this.findOne(id);
  }

  /**
   * Deletes a database entity by its ID.
   *
   * This method first verifies that the database exists by calling `findOne`,
   * and then proceeds to delete it from the repository.
   *
   * @param id - The unique identifier of the database to delete.
   *
   * @returns The result of the deletion operation.
   *
   * @throws {NotFoundException} If no database is found with the provided ID.
   */
  async remove(id: number) {
    await this.findOne(id);
    return this.baseDeDatosRepository.delete(id);
  }
}
