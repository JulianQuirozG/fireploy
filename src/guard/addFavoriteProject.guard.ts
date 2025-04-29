/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';
import { UsuarioService } from 'src/modelos/usuario/usuario.service';

@Injectable()
export class AddFavoriteProject implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usuarioService: UsuarioService,
    private proyectoService: ProyectoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path.split('/').filter((segment) => segment !== '');
    // Obtener el token de sesión
    const sessionToken: string = request.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new BadRequestException(`No se ha enviado el token de sesión`);

    // Verificar el token
    const session = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    // Obtener el ID del proyecto desde los headers
    let proyectoId: string | undefined;
    const usuarioId = session.sub;
    if (path.length > 0) {
      proyectoId = path[2];
    }

    if (!proyectoId)
      throw new BadRequestException(`No se ha enviado el ID del proyecto`);

    const usuario = await this.usuarioService.findOne(usuarioId, true);
    const proyecto = await this.proyectoService.findOne(+proyectoId);

    if (!usuario) throw new BadRequestException(`El usuario no existe`);
    if (!proyecto) throw new BadRequestException(`El proyecto no existe`);
    return true;
  }
}
