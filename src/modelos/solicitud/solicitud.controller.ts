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
} from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { GetSolicitudByIdGuard } from 'src/guard/getSolicitudById.guard';
import { FilterSolicitudDto } from './dto/filter-solicitud.dto';
import { GetSolicitudesGuard } from 'src/guard/getSolicitudes.guard';
import { CreateSolicitudGuard } from 'src/guard/createSolicitud.guard';

@Controller('solicitud')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post()
  @UseGuards(RolesGuard,CreateSolicitudGuard)
  @Roles('Estudiante')
  create(@Body() createSolicitudDto: CreateSolicitudDto) {
    return this.solicitudService.create(createSolicitudDto);
  }

  @Get()
  @UseGuards(GetSolicitudesGuard)
  findAll(@Query() filters: FilterSolicitudDto) {
    return this.solicitudService.findAll(filters);
  }

  @Get(':id')
  @UseGuards(GetSolicitudByIdGuard)
  findOne(@Param('id') id: string) {
    return this.solicitudService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  update(
    @Param('id') id: string,
    @Body() updateSolicitudDto: UpdateSolicitudDto,
  ) {
    return this.solicitudService.update(+id, updateSolicitudDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudService.remove(+id);
  }
}
