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
import * as xlsx from 'xlsx';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepository: Repository<Usuario>,
    private encrypt: Encrypt,
    private firebaseService: FirebaseService,
    private mailService: MailService,
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
      ]);
    }

    return await query.getMany();
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
        `El usuario con el correo: ${correo},no se encuentra en la base de datos`,
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

    const users = plainToInstance(CreateUsuarioDto, data);
    const errors: any[] = [];

    for (const user of users) {
      const errores = await validate(user);
      if (errores.length > 0) errors.push(errores);
    }

    if (errors.length > 0)
      return { mensaje: 'Alguno de los usuarios no se logró cargar', errors };

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

    if (errors.length > 0)
      return { mensaje: 'Alguno de los usuarios no se logró cargar', errors };
    else {
      return { mensaje: 'Usuarios cargados con exito' };
    }
  }

  async changePassword(id: number, updateUsuarioDto: UpdatePasswordDto) {
    return this.mailService.enviarCorreo(
      updateUsuarioDto.correo,
      'Prueba de correo',
      '¡Hola! Este es un correo de prueba desde NestJS.',
    );
  }
}
