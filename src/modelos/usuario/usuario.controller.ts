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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { CreateUserGuard } from 'src/guard/createUser.guard';
import { Public } from 'src/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserPermissionGuard } from 'src/guard/updateUserPermission.guard';
import { UpdateUserImageGuard } from 'src/guard/updateUserImage.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('')
  @UseGuards(CreateUserGuard)
  @Public()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  findAll(@Query() filters: FilterUsuarioDto) {
    return this.usuarioService.findAll(filters, false);
  }

  @Get('/public')
  @Public()
  findAllPublic() {
    return this.usuarioService.findAllPublic();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id, false);
  }

  @Get('/public/:id')
  @Public()
  findOnePublic(@Param('id') id: string) {
    return this.usuarioService.findOnePublic(+id);
  }

  @Patch(':id')
  @UseGuards(UpdateUserPermissionGuard)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Patch('image/:id')
  @UseGuards(UpdateUserImageGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateImageUser(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.usuarioService.updateImageUser(+id, image);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }

  @Post('carga_masiva')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  createUsers(@UploadedFile() file: Express.Multer.File) {
    return this.usuarioService.UploadUsers(file);
  }

  @Post('changepassword/:id')
  @Public()
  password(@Param('id') id: string, @Body() createUsuarioDto: UpdatePasswordDto) {
    return this.usuarioService.changePassword(+id, createUsuarioDto);
  }
    
}
