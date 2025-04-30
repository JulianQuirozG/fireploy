import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BaseDeDatosService } from './base_de_datos.service';
import { CreateBaseDeDatoDto } from './dto/create-base_de_dato.dto';
import { UpdateBaseDeDatoDto } from './dto/update-base_de_dato.dto';
import { GetDataBaseGuard } from 'src/guard/getDataBaseInfo.guard';
import { FilterBaseDeDatoDto } from './dto/filter-base_de_dato.dto';
import { CreateDataBaseGuard } from 'src/guard/createDataBase.guard';
import { updateDataBaseGuard } from 'src/guard/updateDataBase.guard';

@Controller('base-de-datos')
export class BaseDeDatosController {
  constructor(private readonly baseDeDatosService: BaseDeDatosService) {}

  @Post()
  @UseGuards(CreateDataBaseGuard)
  create(@Body() createBaseDeDatoDto: CreateBaseDeDatoDto) {
    return this.baseDeDatosService.create(createBaseDeDatoDto);
  }

  @Get()
  findAll(@Body() filterBaseDeDatoDto: FilterBaseDeDatoDto) {
    return this.baseDeDatosService.findAll(filterBaseDeDatoDto);
  }

  @Get(':id')
  @UseGuards(GetDataBaseGuard)
  findOne(@Param('id') id: string) {
    return this.baseDeDatosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(updateDataBaseGuard)
  update(
    @Param('id') id: string,
    @Body() updateBaseDeDatoDto: UpdateBaseDeDatoDto,
  ) {
    return this.baseDeDatosService.update(+id, updateBaseDeDatoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.baseDeDatosService.remove(+id);
  }
}
