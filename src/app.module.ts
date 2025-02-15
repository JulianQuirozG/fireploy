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
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'fireploy',
      entities: [Usuario, Docente, Estudiante, Administrador, Proyecto, Curso],
      synchronize: true,
    }),
    UsuarioModule,
    DocenteModule,
    EstudianteModule,
    AdministradorModule,
    ProyectoModule,
    CursoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
