import { Injectable } from '@nestjs/common';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { UpdateAdministradorDto } from './dto/update-administrador.dto';

@Injectable()
export class AdministradorService {
  create(createAdministradorDto: CreateAdministradorDto) {
    return 'This action adds a new administrador';
  }

  findAll() {
    return `This action returns all administrador`;
  }

  findOne(id: number) {
    return `This action returns a #${id} administrador`;
  }

  update(id: number, updateAdministradorDto: UpdateAdministradorDto) {
    return `This action updates a #${id} administrador`;
  }

  remove(id: number) {
    return `This action removes a #${id} administrador`;
  }
}
