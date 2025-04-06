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
    const { correo, nuevaContrasenia, contrasenia } = request.body as unknown as UpdatePasswordDto;

    if (!token) {
      throw new UnauthorizedException('No se ha suministrado el token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRETTOKEN,
      });
      
      const user = await this.usuarioService.findOneCorreo(payload.correo);
      if (payload.sub != user?.id || payload.correo != user?.correo || correo != user?.correo) {
        throw new UnauthorizedException('El usuario id del token no coincide con el id del request');
      }

      if (nuevaContrasenia != contrasenia) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
