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

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepository: Repository<Usuario>,
    private encrypt: Encrypt,
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
        `El usuario con el correo: ${correo},nose encontra en la base de datos`,
      );

    return usuario;
  }

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
    await this.usersRepository.save(updateUsuarioDto);

    //Return the updated user
    return await this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
