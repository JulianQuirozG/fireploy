import { forwardRef, Module } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { Estudiante } from './entities/estudiante.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estudiante]),
    forwardRef(() => UsuarioModule),
  ],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService],
})
export class EstudianteModule {}
