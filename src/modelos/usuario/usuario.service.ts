import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
console.log('1-1');
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
console.log('1-2');
import { InjectRepository } from '@nestjs/typeorm';
console.log('1-3');
import { Usuario } from './entities/usuario.entity';
console.log('1-4');
import { Repository } from 'typeorm';
console.log('1-5');
import { Encrypt } from 'src/utilities/hash/hash.encryption';
console.log('1-6');
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
console.log('1-7');
import { FirebaseService } from 'src/services/firebase.service';
console.log('1-8');
import * as xlsx from 'xlsx';
console.log('1-9');
import { plainToInstance } from 'class-transformer';
console.log('1-10');
import { validate } from 'class-validator';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepository: Repository<Usuario>,
    private encrypt: Encrypt,
    private firebaseService: FirebaseService,
  ) {}

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

  //
  async findAll(filters: FilterUsuarioDto) {
    return await this.usersRepository.find({ where: filters });
  }

  async findOne(id: number): Promise<Usuario | undefined> {
    const usuario = await this.usersRepository.findOne({
      where: { id: id },
    });

    if (!usuario)
      throw new NotFoundException(
        `El usuario con el id ${id}, no se encontra en la base de datos.`,
      );

    return usuario;
  }

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
    await this.findOne(id);

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
    updateUsuarioDto.id = id;
    await this.usersRepository.update(id, updateUsuarioDto);

    //Return the updated user
    return await this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }

  /**
   *  Update the profile user image
   * @param id user id to update
   * @param file image to upload
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
}
