import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { Public } from 'src/decorators/public.decorator';
import { ExtractUserIdGuard } from 'src/guard/createProyect.guard';
import { RequestWithUser } from 'src/interfaces/request.interface';
import { updateProyectoGuard } from 'src/guard/updateProyect.guard';
import { AddFavoriteProject } from 'src/guard/addFavoriteProject.guard';
import { DeployProyectoGuard } from 'src/guard/deployProyect.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProjectImageGuard } from 'src/guard/updateProjectImage.guard';
import { RequestProjectWithUser } from 'src/interfaces/request.proyect.interface';
import { GetProjectByUserGuard } from 'src/guard/GetProjectByUser.guard';
import { GetAllProjectsGuard } from 'src/guard/GetAllProyects.guard';

@Controller('proyecto')
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) { }

  @Post()
  @UseGuards(ExtractUserIdGuard)
  create(
    @Body() createProyectoDto: CreateProyectoDto,
    @Req() request: RequestWithUser,
  ) {
    if (!request.user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.proyectoService.create(createProyectoDto, request.user.id);
  }

  @Get()
  @Public()
  @UseGuards(GetAllProjectsGuard)
  findAll(@Req() request: RequestProjectWithUser) {
    return this.proyectoService.findAll(request.user);
  }

  @Patch('image/:id')
  @UseGuards(UpdateProjectImageGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateImageProject(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.proyectoService.updateImageProject(+id, image);
  }


  @Get('/seccion/:id')
  findAllByMateria(@Param('id') id: number) {
    return this.proyectoService.findAllBySection(id);
  }

  @Get('/usuario/:id')
  @Public()
  @UseGuards(GetProjectByUserGuard)
  findAllByUser(@Param('id') id: number,
    @Req() request: RequestProjectWithUser,) {
    return this.proyectoService.findAllbyUser(id, request.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proyectoService.findOne(+id);
  }

  @Get('/public/:id')
  @Public()
  findOnePublic(@Param('id') id: string) {
    return this.proyectoService.findOnePublic(+id);
  }

  @Patch(':id')
  @UseGuards(updateProyectoGuard)
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
  @UseGuards(DeployProyectoGuard)
  cargarProyecto(@Param('id') id: string) {
    return this.proyectoService.cargarProyecto(id);
  }

  @Post('/puntuarProyecto/:id')
  @UseGuards(AddFavoriteProject)
  puntuarProyecto(@Param('id') id: string, @Req() req: Request) {
    return this.proyectoService.puntuarProyecto(id, req);
  }

  @Post('/despuntuarProyecto/:id')
  @UseGuards(AddFavoriteProject)
  despuntuarProyecto(@Param('id') id: string, @Req() req: Request) {
    return this.proyectoService.despuntuarProyecto(id, req);
  }

  @Post('/stop/:id')
  stopProyecto(@Param('id') id: string) {
    return this.proyectoService.changeStatusProyecto(id, 'Stop');
  }

  @Post('/start/:id')
  startProyecto(@Param('id') id: string) {
    return this.proyectoService.changeStatusProyecto(id, 'Start');
  }
}
