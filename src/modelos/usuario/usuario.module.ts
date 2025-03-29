import { forwardRef, Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encrypt } from 'src/utilities/hash/hash.encryption';
import { FirebaseService } from 'src/services/firebase.service';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { ProyectoModule } from '../proyecto/proyecto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    forwardRef(() => EstudianteModule),
    forwardRef(() => ProyectoModule),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, Encrypt, FirebaseService, UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
