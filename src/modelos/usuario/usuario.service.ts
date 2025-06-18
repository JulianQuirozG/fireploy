/* eslint-disable @typescript-eslint/no-base-to-string */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { Encrypt } from 'src/utilities/hash/hash.encryption';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { FirebaseService } from 'src/services/firebase.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { MailService } from 'src/mail/mail.service';
import { Workbook } from 'exceljs';
import { NotificationsGateway } from 'src/socket/notification.gateway';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepository: Repository<Usuario>,
    private encrypt: Encrypt,
    private firebaseService: FirebaseService,
    private mailService: MailService,
    private notificationService: NotificationsGateway,
  ) {}
  /**
   * Creates a new user after validating the email is not already registered.
   * The user's password is securely hashed before saving.
   *
   * @param createUsuarioDto - An object containing the user's registration data, including email and plain password.
   * @returns A promise that resolves with the newly created user.
   *
   * @throws BadRequestException if a user with the provided email already exists.
   */
  async create(createUsuarioDto: CreateUsuarioDto) {
    //verify user exists
    const user = await this.usersRepository.findOne({
      where: { correo: createUsuarioDto.correo },
    });

    if (user)
      throw new BadRequestException(
        `El usuario con el correo '${createUsuarioDto.correo}' ya se encuentra registrado.`,
      );

    //Encrypt password
    const encrypted_password = this.encrypt.getHash(
      createUsuarioDto.contrasenia,
    );
    createUsuarioDto.contrasenia = await encrypted_password;
    //Create the user
    return await this.usersRepository.save(createUsuarioDto);
  }

  /**
   * Retrieves a list of users based on optional filters.
   *
   * @param filters - Criteria used to filter users (e.g., by ID, type, or other attributes).
   * @param all_info - A boolean indicating whether to return complete user records (true) or only selected fields (false).
   * @returns A promise that resolves with an array of users matching the filters.
   */
  async findAll(
    filters: FilterUsuarioDto,
    all_info: boolean,
  ): Promise<Usuario[]> {
    const query = this.usersRepository
      .createQueryBuilder('usuario')
      .where(filters);

    if (!all_info) {
      query.select([
        'usuario.id',
        'usuario.nombre',
        'usuario.apellido',
        'usuario.fecha_nacimiento',
        'usuario.sexo',
        'usuario.descripcion',
        'usuario.correo',
        'usuario.red_social',
        'usuario.foto_perfil',
        'usuario.est_fecha_inicio',
        'usuario.tipo',
        'usuario.tipo',
        'usuario.estado',
      ]);
    }

    return await query.getMany();
  }

  /**
   * Retrieves a list of all users with publicly safe profile information.
   *
   * This method is intended for public access (no authentication required),
   * and returns a sanitized subset of user fields only. Sensitive data such as
   * passwords, roles with elevated permissions, tokens, or internal metadata
   * are intentionally excluded.
   *
   * Fields returned:
   * - id
   * - nombre
   * - apellido
   * - correo
   * - red_social
   * - foto_perfil
   * - est_fecha_inicio
   * - tipo
   * - estado
   *
   * @returns A promise resolving to an array of public user profiles.
   */
  async findAllPublic(): Promise<Usuario[]> {
    return await this.usersRepository
      .createQueryBuilder('usuario')
      .select([
        'usuario.id',
        'usuario.nombre',
        'usuario.apellido',
        'usuario.red_social',
        'usuario.foto_perfil',
        'usuario.est_fecha_inicio',
        'usuario.tipo',
        'usuario.tipo',
        'usuario.estado',
      ])
      .getMany();
  }

  /**
   * Retrieves a single user by their ID, optionally returning full or partial details.
   *
   * @param id - The ID of the user to retrieve.
   * @param all_info - A boolean indicating whether to return the complete user record (true) or only selected fields (false).
   * @returns A promise that resolves with the user if found.
   *
   * @throws NotFoundException if no user exists with the given ID.
   */
  async findOne(id: number, all_info: boolean): Promise<Usuario> {
    const query = this.usersRepository
      .createQueryBuilder('usuario')
      .where('usuario.id = :id', { id });

    if (!all_info) {
      query.select([
        'usuario.id',
        'usuario.nombre',
        'usuario.apellido',
        'usuario.fecha_nacimiento',
        'usuario.sexo',
        'usuario.descripcion',
        'usuario.correo',
        'usuario.red_social',
        'usuario.foto_perfil',
        'usuario.est_fecha_inicio',
        'usuario.tipo',
        'usuario.estado',
      ]);
    }

    const usuario = await query.getOne();
    if (!usuario) {
      throw new NotFoundException(
        `El usuario con el id ${id} no se encuentra en la base de datos.`,
      );
    }

    return usuario;
  }

  /**
   * Retrieves a public user profile by its ID with limited, non-sensitive information.
   *
   * This method is accessible without authentication and returns only fields
   * deemed safe for public exposure. Sensitive data such as password hashes,
   * roles, tokens, or internal-only flags are not included.
   *
   * Fields returned:
   * - id
   * - nombre
   * - apellido
   * - fecha_nacimiento
   * - sexo
   * - descripcion
   * - correo
   * - red_social
   * - foto_perfil
   * - est_fecha_inicio
   * - tipo
   * - estado
   * @param id - The ID of the user to retrieve.
   * @returns A promise resolving to the user's public profile.
   * @throws NotFoundException if the user is not found.
   */
  async findOnePublic(id: number): Promise<Usuario> {
    const query = this.usersRepository
      .createQueryBuilder('usuario')
      .where('usuario.id = :id', { id })
      .select([
        'usuario.id',
        'usuario.nombre',
        'usuario.apellido',
        'usuario.fecha_nacimiento',
        'usuario.sexo',
        'usuario.descripcion',
        'usuario.red_social',
        'usuario.foto_perfil',
        'usuario.est_fecha_inicio',
        'usuario.tipo',
        'usuario.estado',
      ]);

    const usuario = await query.getOne();
    if (!usuario) {
      throw new NotFoundException(
        `El usuario con el id ${id} no se encuentra en la base de datos.`,
      );
    }

    return usuario;
  }

  /**
   * Retrieves a single user by their email address.
   *
   * @param correo - The email address of the user to find.
   * @returns A promise that resolves with the user if found.
   *
   * @throws NotFoundException if no user is found with the provided email address.
   */
  async findOneCorreo(correo: string): Promise<Usuario | undefined> {
    const usuario = await this.usersRepository.findOne({
      where: { correo: correo },
    });

    if (!usuario)
      throw new NotFoundException(
        `El usuario con el correo: ${correo}, no se encuentra en la base de datos`,
      );

    return usuario;
  }

  /**
   * Updates a user by their ID.
   *
   * @param id - The ID of the user to update.
   * @param updateUsuarioDto - The data to update the user with.
   * @returns The updated user.
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    //Verify user exists
    await this.findOne(id, true);

    //Verify update data
    if (
      Object.keys(updateUsuarioDto).length === 0 ||
      updateUsuarioDto === undefined
    ) {
      throw new BadRequestException(
        'Se debe enviar al menos un campo para actualizar',
      );
    }

    //Update the user
    const result = await this.usersRepository.update(id, updateUsuarioDto);

    //Return the updated user
    return await this.findOne(id, true);
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }

  /**
   * Updates the profile image of a user by uploading a new file and saving its URL.
   *
   * @param id - The ID of the user whose profile image will be updated.
   * @param file - The image file to upload (received via Multer).
   * @returns A promise that resolves with the updated user including the new profile image URL.
   *
   * @throws NotFoundException if the user with the given ID does not exist.
   * @throws InternalServerErrorException if the upload fails or the update operation encounters an error.
   */
  async updateImageUser(id: number, file: Express.Multer.File) {
    //check imagen type
    if (
      !(process.env.ALLOWED_IMAGE_MIME_TYPES as unknown as string[]).includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        'El archivo debe ser extension (jpg, jpeg, png, gif o webp)',
      );
    }

    //Save the image

    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `User_Image_${id}.${fileExtension}`;

    const renamedFile = {
      ...file,
      originalname: newFileName,
    };
    const url = await this.firebaseService.uploadFile(renamedFile);

    //UpdateUser info
    const user = await this.update(id, {
      foto_perfil: url,
    } as UpdateUsuarioDto);
    return user;
  }

  /**
   * Uploads a list of users from an Excel file and stores them in the database.
   *
   * @param file The uploaded Excel file containing user data.
   * @returns An object indicating the status of each user creation, including any errors encountered.
   *
   * @throws BadRequestException If no file is uploaded.
   * @throws Error If the file is not a valid Excel file (.xls or .xlsx).
   */
  async UploadUsers(file: Express.Multer.File) {
    // Verificar que se haya cargado un archivo
    if (!file) {
      throw new BadRequestException('No se ha cargado ningún archivo');
    }

    // Verificar la extensión del archivo
    if (
      !(process.env.ALLOWED_MIME_TYPES as unknown as string[]).includes(
        file.mimetype,
      )
    ) {
      throw new Error('El archivo debe ser un Excel (.xls o .xlsx)');
    }

    // Leer el archivo con exceljs desde el buffer
    const workbook = new Workbook();
    const buffer = new Uint8Array(file.buffer).buffer;
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    // Leer encabezados de la primera fila
    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(String(cell.value ?? ''));
    });

    // Convertir filas en objetos
    const data: Record<string, any>[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Saltar encabezado

      const rowData: Record<string, any> = {};
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.value;
      });

      data.push(rowData);
    });

    // Transformar a DTOs y validar
    const users = plainToInstance(CreateUsuarioDto, data);
    const errors: any[] = [];

    for (const user of users) {
      const errores = await validate(user);
      if (errores.length > 0) errors.push(errores);
    }

    if (errors.length > 0) {
      return {
        mensaje: 'Alguno de los usuarios no se logró cargar',
        errors,
      };
    }

    for (const user of users) {
      try {
        await this.create(user);
      } catch (error) {
        errors.push({
          tittle: `El usuario con correo ${user.correo} No se pudo registrar`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message: error.message,
        });
      }
    }

    if (errors.length > 0) {
      return {
        mensaje: 'Alguno de los usuarios no se logró cargar',
        errors,
      };
    } else {
      return {
        mensaje: 'Usuarios cargados con éxito',
      };
    }
  }

  /**
 * Sends a test email to confirm password change functionality.
 *
 * @param id - The ID of the user whose password is being updated.
 * @param updateUsuarioDto - DTO containing the user's email and new password.
 * @returns A promise resolving when the email has been sent.
 */
  async changePassword(id: number, updateUsuarioDto: UpdatePasswordDto) {
    return this.mailService.enviarCorreo(
      updateUsuarioDto.correo,
      'Prueba de correo',
      '¡Hola! Este es un correo de prueba desde NestJS.',
    );
  }
}
