import { UsuarioModule } from '../usuario/usuario.module';
import { forwardRef, Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto } from './entities/proyecto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocenteModule } from '../docente/docente.module';
import { CursoModule } from '../curso/curso.module';
import { SeccionModule } from '../seccion/seccion.module';
import { BaseDeDatosModule } from '../base_de_datos/base_de_datos.module';
import { GitService } from 'src/services/git.service';
import { DockerfileService } from 'src/services/docker.service';
import { SystemService } from 'src/services/system.service';
import { EstudianteModule } from '../estudiante/estudiante.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto]),
    forwardRef(() => UsuarioModule),
    DocenteModule,
    CursoModule,
    SeccionModule,
    EstudianteModule,
    forwardRef(() => BaseDeDatosModule),
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService, GitService, DockerfileService, SystemService],
  exports: [ProyectoService],
})
export class ProyectoModule {}
