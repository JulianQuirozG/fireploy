import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('proyecto')
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Post()
  create(@Body() createProyectoDto: CreateProyectoDto) {
    return this.proyectoService.create(createProyectoDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.proyectoService.findAll();
  }

  @Get('/seccion/:id')
  findAllByMateria(@Param('id') id: number) {
    return this.proyectoService.findAllBySection(id);
  }

  @Get('/estudiante/:id')
  findAllByEstudiante(@Param('id') id: number) {
    return this.proyectoService.findAllbyStudent(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proyectoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProyectoDto: UpdateProyectoDto,
  ) {
    return this.proyectoService.update(+id, updateProyectoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proyectoService.remove(+id);
  }

  @Post(':id')
  cargarProyecto(@Param('id') id: string) {
    return this.proyectoService.cargarProyecto(id);
  }
}
