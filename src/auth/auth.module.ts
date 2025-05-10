import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Encrypt } from 'src/utilities/hash/hash.encryption';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from 'src/modelos/usuario/usuario.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    forwardRef(() => UsuarioModule),
    MailModule,
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
