import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { RepositorioService } from './repositorio.service';
import { CreateRepositorioDto } from './dto/create-repositorio.dto';
import { UpdateRepositorioDto } from './dto/update-repositorio.dto';
import { CreateRepositorioGuard } from 'src/guard/createRepositorio.guard';
import { updateRepositorioGuard } from 'src/guard/updateRepositorio.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PueshRepositorioMiddleware } from 'src/middleware/pushRepositorio.middleware';

@Controller('repositorio')
export class RepositorioController {
  constructor(private readonly repositorioService: RepositorioService) {}

  @Post()
  @UseGuards(CreateRepositorioGuard)
  create(@Body() createRepositorioDto: CreateRepositorioDto) {
    return this.repositorioService.create(createRepositorioDto);
  }

  @Get()
  findAll() {
    return this.repositorioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repositorioService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(updateRepositorioGuard)
  update(
    @Param('id') id: string,
    @Body() updateRepositorioDto: UpdateRepositorioDto,
  ) {
    return this.repositorioService.update(+id, updateRepositorioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repositorioService.remove(+id);
  }

  @Post('uploadZip/:id')
  @UseGuards(updateRepositorioGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `${process.env.FOLDER_ROUTE_ZIP}`,
        filename: (req, file, cb) => {
          if (!fs.existsSync(`${process.env.FOLDER_ROUTE_ZIP}`)) {
            fs.mkdirSync(`${process.env.FOLDER_ROUTE_ZIP}`, {
              recursive: true,
            });
          }
          cb(null, `${Date.now()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  //@UseGuards(PueshRepositorioMiddleware)
  async uploadProjectZip(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.repositorioService.uploadProjectZip(file.path, id);
  }
}
