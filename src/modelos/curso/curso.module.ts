import { forwardRef, Module } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { Curso } from './entities/curso.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MateriaModule } from '../materia/materia.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { DocenteModule } from '../docente/docente.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Curso]),
    MateriaModule,
    forwardRef(() => UsuarioModule),
    EstudianteModule,
    DocenteModule,
  ],
  controllers: [CursoController],
  providers: [CursoService],
  exports: [CursoService],
})
export class CursoModule {}
