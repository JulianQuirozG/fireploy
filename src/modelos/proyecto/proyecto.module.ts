import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto } from './entities/proyecto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { DocenteModule } from '../docente/docente.module';
import { CursoModule } from '../curso/curso.module';
import { SeccionModule } from '../seccion/seccion.module';
import { BaseDeDatosModule } from '../base_de_datos/base_de_datos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto]),
    EstudianteModule,
    DocenteModule,
    CursoModule,
    SeccionModule,
    BaseDeDatosModule,
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService],
  exports: [ProyectoService],
})
export class ProyectoModule {}
