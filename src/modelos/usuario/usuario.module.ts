import { forwardRef, Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encrypt } from 'src/utilities/hash/hash.encryption';
import { FirebaseService } from 'src/services/firebase.service';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { ProyectoModule } from '../proyecto/proyecto.module';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/socket/notification.module';
//import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    forwardRef(() => EstudianteModule),
    forwardRef(() => ProyectoModule),
    MailModule,
    NotificationsModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, Encrypt, FirebaseService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
