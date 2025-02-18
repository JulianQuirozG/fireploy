import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from 'src/modelos/usuario/usuario.service';
import { Encrypt } from 'src/utilities/hash/hash.encryption';

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
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
