import { Module } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { Curso } from './entities/curso.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MateriaModule } from '../materia/materia.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { Usuario } from '../usuario/entities/usuario.entity';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { DocenteService } from '../docente/docente.service';
import { DocenteModule } from '../docente/docente.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Curso, Usuario]),
    MateriaModule,
    UsuarioModule,
    EstudianteModule,
    DocenteModule,
  ],
  controllers: [CursoController],
  providers: [CursoService],
  exports: [CursoService],
})
export class CursoModule {}
