import { Injectable } from '@nestjs/common';
import { CreateFicheroDto } from './dto/create-fichero.dto';
import { UpdateFicheroDto } from './dto/update-fichero.dto';

@Injectable()
export class FicherosService {
  create(createFicheroDto: CreateFicheroDto) {
    return 'This action adds a new fichero';
  }

  findAll() {
    return `This action returns all ficheros`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fichero`;
  }

  update(id: number, updateFicheroDto: UpdateFicheroDto) {
    return `This action updates a #${id} fichero`;
  }

  remove(id: number) {
    return `This action removes a #${id} fichero`;
  }
}
