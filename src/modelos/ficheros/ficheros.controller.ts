import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FicherosService } from './ficheros.service';
import { CreateFicheroDto } from './dto/create-fichero.dto';
import { UpdateFicheroDto } from './dto/update-fichero.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JsonFileValidationPipe } from 'src/pipe/json-file-validation.pipe';

@Controller('ficheros')
export class FicherosController {
  constructor(private readonly ficherosService: FicherosService) { }

  @Post()
  @UseInterceptors(FileInterceptor('contenido'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFicheroDto: CreateFicheroDto) {

    return this.ficherosService.create(createFicheroDto, file);
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
