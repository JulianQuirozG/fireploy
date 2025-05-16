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
import { RepositorioModule } from '../repositorio/repositorio.module';
import { DeployModule } from 'src/Queue/deploy.module';
import { NotificationsModule } from 'src/socket/notification.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { FirebaseService } from 'src/services/firebase.service';
import { LogService } from '../log/log.service';
import { LogModule } from '../log/log.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto]),
    forwardRef(() => UsuarioModule),
    DocenteModule,
    CursoModule,
    SeccionModule,
    EstudianteModule,
    forwardRef(() => BaseDeDatosModule),
    forwardRef(() => RepositorioModule),
    DeployModule,
    NotificationsModule,
    NotificacionesModule,
    LogModule,
  ],
  controllers: [ProyectoController],
  providers: [
    ProyectoService,
    GitService,
    DockerfileService,
    SystemService,
    FirebaseService,
  ],
  exports: [ProyectoService],
})
export class ProyectoModule {}
