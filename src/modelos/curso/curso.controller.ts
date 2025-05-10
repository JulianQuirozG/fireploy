import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CursoService } from './curso.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { FilterCursoDto } from './dto/filter-curso.dto';
import { CreateCursoPermissionGuard } from 'src/guard/patchCurso.guard';
import { addEstudiantesCursoDto } from './dto/add-estudiantes-curso.dto';
import { AddEstudianteCursoGuard } from 'src/guard/addEstusiantesCurso.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('curso')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  create(@Body() createCursoDto: CreateCursoDto) {
    return this.cursoService.create(createCursoDto);
  }

  @Get()
  findAll(@Query() filters: FilterCursoDto) {
    return this.cursoService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cursoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, CreateCursoPermissionGuard)
  @Roles('Administrador', 'Docente')
  update(@Param('id') id: string, @Body() updateCursoDto: UpdateCursoDto) {
    return this.cursoService.update(id, updateCursoDto);
  }

  @Patch('alumnos/:id')
  @UseGuards(AddEstudianteCursoGuard)
  addStudents(
    @Param('id') id: string,
    @Body() updateCursoDto: addEstudiantesCursoDto,
  ) {
    return this.cursoService.addStudents(id, updateCursoDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.cursoService.remove(id);
  }

  @Post('carga_masiva')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  uploadCursos(@UploadedFile() file: Express.Multer.File) {
    return this.cursoService.uploadCurso(file);
  }
}
