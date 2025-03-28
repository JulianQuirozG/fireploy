import { forwardRef, Module } from '@nestjs/common';
console.log('1');
import { UsuarioService } from './usuario.service';
console.log('2');
import { UsuarioController } from './usuario.controller';
console.log('3');
import { Usuario } from './entities/usuario.entity';
console.log('4');
import { TypeOrmModule } from '@nestjs/typeorm';
console.log('5');
import { Encrypt } from 'src/utilities/hash/hash.encryption';
console.log('6');
import { FirebaseService } from 'src/services/firebase.service';
console.log('7');
import { EstudianteModule } from '../estudiante/estudiante.module';
console.log('8');
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
