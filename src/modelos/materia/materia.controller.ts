import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MateriaService } from './materia.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('materia')
export class MateriaController {
  constructor(private readonly materiaService: MateriaService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  create(@Body() createMateriaDto: CreateMateriaDto) {
    return this.materiaService.create(createMateriaDto);
  }

  @Get()
  findAll() {
    return this.materiaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materiaService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateMateriaDto: UpdateMateriaDto) {
    return this.materiaService.update(+id, updateMateriaDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.materiaService.remove(+id);
  }

  @Post('carga_masiva')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  createUsers(@UploadedFile() file: Express.Multer.File) {
    return this.materiaService.UploadMaterias(file);
  }
}
