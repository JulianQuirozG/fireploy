/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/interfaces/request.interface';
import { UpdatePasswordUserDto } from 'src/modelos/usuario/dto/update-password-user.dto';
import { UpdatePasswordDto } from 'src/modelos/usuario/dto/update-password.dto';
import { UsuarioService } from 'src/modelos/usuario/usuario.service';

@Injectable()
export class RecoverPasswordGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService,
    private usuarioService: UsuarioService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = request.headers['sessiontoken'] as string;
    const { correo, nuevaContrasenia, contrasenia } = request.body as unknown as UpdatePasswordUserDto;

    if (!token) {
      throw new UnauthorizedException('No se ha suministrado el token');
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRETTOKEN,
      });
    } catch (err) {
      throw new UnauthorizedException('Token de sesión inválido o expirado');
    }

    const user = await this.usuarioService.findOneCorreo(payload.correo);
    if (payload.sub != user?.id || payload.correo != user?.correo || correo != user?.correo) {
      throw new UnauthorizedException('El correo suministrado por el usuario no coincide con el que se utilizó para solicitar el token.');
    }

    if (nuevaContrasenia != contrasenia) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    return true;
  }
}
