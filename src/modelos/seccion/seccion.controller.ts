import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SeccionService } from './seccion.service';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { UpdateSeccionDto } from './dto/update-seccion.dto';
import { FilterSeccionDto } from './dto/filter-seccion.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateSeccionGuard } from 'src/guard/createSeccion.guard';
import { updateSeccionGuard } from 'src/guard/updateSeccion.guard';

@Controller('seccion')
export class SeccionController {
  constructor(private readonly seccionService: SeccionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @UseGuards(CreateSeccionGuard)
  @Roles('Administrador', 'Docente')
  create(@Body() createSeccionDto: CreateSeccionDto) {
    return this.seccionService.create(createSeccionDto);
  }

  @Get()
  findAll(@Query() filters: FilterSeccionDto) {
    return this.seccionService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seccionService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, updateSeccionGuard)
  @Roles('Administrador', 'Docente')
  update(@Param('id') id: string, @Body() updateSeccionDto: UpdateSeccionDto) {
    return this.seccionService.update(+id, updateSeccionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Administrador', 'Docente')
  remove(@Param('id') id: string) {
    return this.seccionService.remove(+id);
  }
}
