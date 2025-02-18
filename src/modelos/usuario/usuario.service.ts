import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { Encrypt } from 'src/utilities/hash/hash.encryption';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepository: Repository<Usuario>,
    private encrypt: Encrypt,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    //Comprobar si existe un usuario con el mismo correo
    const user = await this.usersRepository.findOne({
      where: { correo: createUsuarioDto.correo },
    });

    if (user)
      throw new BadRequestException(
        `El usuario con el correo '${createUsuarioDto.correo}' ya se encuentra registrado.`,
      );

    //Encriptar la contraseña
    const encrypted_password = this.encrypt.getHash(
      createUsuarioDto.contrasenia,
    );
    createUsuarioDto.contrasenia = await encrypted_password;
    //Crear al nuevo usuario
    return await this.usersRepository.save(createUsuarioDto);
  }

  findAll() {
    return `This action returns all usuario`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
