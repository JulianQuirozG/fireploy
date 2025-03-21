import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './modelos/usuario/usuario.module';
import { Usuario } from './modelos/usuario/entities/usuario.entity';
import { DocenteModule } from './modelos/docente/docente.module';
import { Docente } from './modelos/docente/entities/docente.entity';
import { EstudianteModule } from './modelos/estudiante/estudiante.module';
import { Estudiante } from './modelos/estudiante/entities/estudiante.entity';
import { AdministradorModule } from './modelos/administrador/administrador.module';
import { Administrador } from './modelos/administrador/entities/administrador.entity';
import { ProyectoModule } from './modelos/proyecto/proyecto.module';
import { Proyecto } from './modelos/proyecto/entities/proyecto.entity';
import { CursoModule } from './modelos/curso/curso.module';
import { Curso } from './modelos/curso/entities/curso.entity';
import { MateriaModule } from './modelos/materia/materia.module';
import { Materia } from './modelos/materia/entities/materia.entity';
import { SeccionModule } from './modelos/seccion/seccion.module';
import { Seccion } from './modelos/seccion/entities/seccion.entity';
import { RepositorioModule } from './modelos/repositorio/repositorio.module';
import { Repositorio } from './modelos/repositorio/entities/repositorio.entity';
import { BaseDeDatosModule } from './modelos/base_de_datos/base_de_datos.module';
import { BaseDeDato } from './modelos/base_de_datos/entities/base_de_dato.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SessionTokenGuard } from './guard/sessionToken.guard';
import { DockerfileService } from './services/docker.service';
import { SolicitudModule } from './modelos/solicitud/solicitud.module';
import { Solicitud } from './modelos/solicitud/entities/solicitud.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: process.env.BD_PORT as unknown as number,
      username: process.env.BD_USER_NAME as unknown as string,
      password: process.env.BD_PASSWORD as unknown as string,
      database: process.env.BD_NAME as unknown as string,
      entities: [
        Usuario,
        Docente,
        Estudiante,
        Administrador,
        Proyecto,
        Curso,
        Materia,
        Seccion,
        Repositorio,
        BaseDeDato,
        Solicitud,
      ],
      synchronize: true,
    }),
    UsuarioModule,
    DocenteModule,
    EstudianteModule,
    AdministradorModule,
    ProyectoModule,
    CursoModule,
    MateriaModule,
    SeccionModule,
    RepositorioModule,
    BaseDeDatosModule,
    AuthModule,
    SolicitudModule,
  ],
  controllers: [AppController],
  providers: [
    DockerfileService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: SessionTokenGuard,
    },
  ],
})
export class AppModule {}
