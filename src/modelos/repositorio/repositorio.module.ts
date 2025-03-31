import { forwardRef, Module } from '@nestjs/common';
import { RepositorioService } from './repositorio.service';
import { RepositorioController } from './repositorio.controller';
import { Repositorio } from './entities/repositorio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoModule } from '../proyecto/proyecto.module';
import { Proyecto } from '../proyecto/entities/proyecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Repositorio,]), forwardRef(() => ProyectoModule),],
  controllers: [RepositorioController],
  providers: [RepositorioService],
  exports: [RepositorioService],
})
export class RepositorioModule { }
