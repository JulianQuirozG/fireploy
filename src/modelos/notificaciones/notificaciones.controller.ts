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
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { GetNotificacionesGuard } from 'src/guard/getNotificaciones.guard';
import { VerNotificacionesGuard } from 'src/guard/verNotifiaccion.guard';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  create(@Body() createNotificacioneDto: CreateNotificacioneDto) {
    return this.notificacionesService.create(createNotificacioneDto);
  }

  @UseGuards(GetNotificacionesGuard)
  @Get('usuario/:id')
  findAllByUser(@Param('id') id: string) {
    return this.notificacionesService.findAllByUser(+id);
  }

  //@Get(':id')
  //findOne(@Param('id') id: string) {
  //  return this.notificacionesService.findOne(+id);
  //}

  @UseGuards(VerNotificacionesGuard)
  @Patch(':id')
  verNotificacion(@Param('id') id: string) {
    return this.notificacionesService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificacionesService.remove(+id);
  }
}
