import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FicherosService } from './ficheros.service';
import { CreateFicheroDto } from './dto/create-fichero.dto';
import { UpdateFicheroDto } from './dto/update-fichero.dto';

@Controller('ficheros')
export class FicherosController {
  constructor(private readonly ficherosService: FicherosService) {}

  @Post()
  create(@Body() createFicheroDto: CreateFicheroDto) {
    return this.ficherosService.create(createFicheroDto);
  }

  @Get()
  findAll() {
    return this.ficherosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ficherosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFicheroDto: UpdateFicheroDto) {
    return this.ficherosService.update(+id, updateFicheroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ficherosService.remove(+id);
  }
}
