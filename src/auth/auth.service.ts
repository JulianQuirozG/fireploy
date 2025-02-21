import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import { UsuarioService } from 'src/modelos/usuario/usuario.service';
import { Encrypt } from 'src/utilities/hash/hash.encryption';
import { StringDecoder } from 'string_decoder';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private encrypt: Encrypt,
    private jwtService: JwtService,
  ) {}

  async signIn(
    correo: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usuarioService.findOneCorreo(correo);
    const answer = await this.encrypt.compare(pass, user?.contrasenia);
    if (!answer) throw new UnauthorizedException();
    const payload = { sub: user?.id, tipo: user?.tipo };
    return {
      access_token: String(
        await this.jwtService.signAsync(payload, {
          secret: process.env.SECRETTOKEN,
        }),
      ),
    };
  }
}
