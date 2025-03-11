import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encrypt } from 'src/utilities/hash/hash.encryption';
import { FirebaseService } from 'src/services/firebase.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [UsuarioService, Encrypt, FirebaseService, UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
