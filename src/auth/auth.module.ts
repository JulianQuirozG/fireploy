import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Encrypt } from 'src/utilities/hash/hash.encryption';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from 'src/modelos/usuario/usuario.module';

@Module({
  imports: [
    UsuarioModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRETTOKEN as string,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Encrypt],
  exports: [AuthService],
})
export class AuthModule {}
