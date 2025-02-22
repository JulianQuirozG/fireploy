import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { tokenMiddleware } from './middleware/token.middleware';
import { ConfigModule } from '@nestjs/config';
import { createUsuarioPermissionsMiddleware } from './middleware/createUsuarioPermission.middleware';
import { getUserPermissionMiddleware } from './middleware/getUserPermission.middleware';
import { updateUsuarioPermissionMiddleware } from './middleware/updateUsuarioPermission.middleware';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'fireploy',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(tokenMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'usuario/crear', method: RequestMethod.ALL },
      )
      .forRoutes('*')
      .apply(createUsuarioPermissionsMiddleware)
      .forRoutes({ path: 'usuario/crear', method: RequestMethod.ALL })
      .apply(getUserPermissionMiddleware)
      .forRoutes(
        { path: 'usuario/*', method: RequestMethod.GET },
        { path: 'usuario', method: RequestMethod.GET },
      )
      .apply(updateUsuarioPermissionMiddleware)
      .forRoutes({ path: 'usuario/*', method: RequestMethod.PATCH });
  }
}
