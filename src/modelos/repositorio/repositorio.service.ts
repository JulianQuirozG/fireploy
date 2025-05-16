/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
import { VariablesDeEntorno } from 'src/interfaces/variables_entorno.interface';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import { GitService } from 'src/services/git.service';
@Injectable()
export class RepositorioService {
  constructor(
    @InjectRepository(Repositorio)
    private repositorioRepository: Repository<Repositorio>,
    @Inject(forwardRef(() => ProyectoService))
    private proyectoRepository: ProyectoService,
    private gitService: GitService,
  ) {}

  /**
   * Creates a new repository associated with an existing project.
   *
   * @param createRepositorioDto - An object containing the repository data, including version, URL, type,
   * technology, framework, project ID, and optional environment variables.
   * @returns A promise that resolves with the newly created repository, fully populated.
   *
   * @throws BadRequestException if the provided project ID does not exist.
   */
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
      framework: createRepositorioDto.framework,
      proyecto_id: proyecto,
    });

    if (
      createRepositorioDto.variables_de_entorno &&
      createRepositorioDto.variables_de_entorno.length > 0
    ) {
      nuevorepositorio.variables_de_entorno =
        createRepositorioDto.variables_de_entorno
          .map((variable_entorno: VariablesDeEntorno) => {
            return variable_entorno.clave + `=` + variable_entorno.valor;
          })
          .join('\n');
    }

    await this.repositorioRepository.save(nuevorepositorio);

    return await this.findOne(nuevorepositorio.id);
  }

  /**
   * Retrieves all repositories, optionally filtered by project ID.
   *
   * @param filters - Optional filtering criteria, including the project ID.
   * @returns A promise that resolves with an array of repositories,
   * each including its associated project.
   *
   * @throws BadRequestException if the provided project ID does not correspond to an existing project.
   */
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

  /**
   * Retrieves a single repository by its ID, including its associated project.
   *
   * @param id - The ID of the repository to retrieve.
   * @returns A promise that resolves with the repository object if found, including its related project.
   *
   * @throws NotFoundException if no repository exists with the specified ID.
   */
  async findOne(id: number) {
    const repo = await this.repositorioRepository.findOne({
      where: { id: id },
      relations: ['proyecto_id', 'logs'],
    });
    if (!repo) {
      throw new NotFoundException(`El repositorio con el id: ${id}, no existe`);
    }
    return repo;
  }

  /**
   * Updates an existing repository with the provided data.
   *
   * @param id - The ID of the repository to update.
   * @param updateRepositorioDto - An object containing the fields to update, including optional environment variables.
   * @returns A promise that resolves with the updated repository.
   *
   * @throws NotFoundException if the repository with the given ID does not exist.
   */
  async update(id: number, updateRepositorioDto: UpdateRepositorioDto) {
    //Verify repositorio exists
    let repo = await this.findOne(id);
    updateRepositorioDto.id = repo.id;
    //update repository
    if (
      updateRepositorioDto.variables_de_entorno &&
      updateRepositorioDto.variables_de_entorno.length > 0
    ) {
      repo.variables_de_entorno = updateRepositorioDto.variables_de_entorno
        .map((variable_entorno: VariablesDeEntorno) => {
          return variable_entorno.clave + `=` + variable_entorno.valor;
        })
        .join('\n');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variables_de_entorno, ...restoDto } = updateRepositorioDto;

    repo = {
      ...repo,
      ...restoDto,
    };

    await this.repositorioRepository.save(repo);
    return this.findOne(id);
  }

  /**
   * Deletes a repository by its ID.
   *
   * @param id - The ID of the repository to delete.
   * @returns A promise that resolves with a confirmation message including the repository ID and associated project reference.
   *
   * @throws NotFoundException if the repository with the given ID does not exist.
   */
  async remove(id: number) {
    const repository = await this.findOne(id);
    await this.repositorioRepository.delete(repository.id);
    return `repositorio con el #${id} ha sido eliminado, con referencia al proyecto ${repository.proyecto_id} ha sido elimnado correctamente`;
  }

  async uploadProjectZip(filePath: string, id: string) {
    const tempDir = path.join(
      `${process.env.FOLDER_ROUTE_ZIP}`,
      'temp',
      filePath,
    );

    //Crear un directorio temporal para almacenar los archivos
    fs.mkdirSync(tempDir, { recursive: true });
    try {
      const zip = new AdmZip(filePath);
      zip.extractAllTo(tempDir, true);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    let repo, exist;

    try {
      exist = await this.gitService.repoExists(id);
    } catch {
      repo = await this.gitService.createGitHubRepo(id);
      exist = await this.gitService.repoExists(id);
    }

    const url = `https://Fireploy:${process.env.GIT_TOKEN}@github.com/Fireploy/${id}.git`;

    await this.gitService.pushFolderToRepo(tempDir, url);

    const repositorio = await this.update(+id, {
      url: exist,
    } as UpdateRepositorioDto);

    return repositorio;
  }
}
