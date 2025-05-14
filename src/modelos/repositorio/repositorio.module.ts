import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { RepositorioService } from './repositorio.service';
import { RepositorioController } from './repositorio.controller';
import { Repositorio } from './entities/repositorio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoModule } from '../proyecto/proyecto.module';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { GitService } from 'src/services/git.service';
import { PueshRepositorioMiddleware } from 'src/middleware/pushRepositorio.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Repositorio,]), forwardRef(() => ProyectoModule),],
  controllers: [RepositorioController],
  providers: [RepositorioService, GitService],
  exports: [RepositorioService],
})
export class RepositorioModule { }
