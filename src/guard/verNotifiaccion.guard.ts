/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { NotificacionesService } from 'src/modelos/notificaciones/notificaciones.service';

@Injectable()
export class VerNotificacionesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private notificacionService: NotificacionesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path.split('/').filter((segment) => segment !== '');

    // get sessiontoken
    const sessionToken: string = request.headers['sessiontoken'] as string;
    if (!sessionToken) {
      throw new UnauthorizedException('No se ha enviado el token de sesión');
    }

    // Verify sessiontoken

    let session;
    try {
      session = await this.jwtService.verifyAsync(sessionToken, {
        secret: process.env.SECRETTOKEN,
      });
    } catch (err) {
      throw new UnauthorizedException('Token de sesión inválido o expirado');
    }

    let id: string | undefined = '';
    if (path.length > 0) {
      id = path[1];
    }

    //Verify notificacion exists
    const notificacion = await this.notificacionService.findOne(+id);
    if (notificacion.length == 0)
      throw new NotFoundException(`La notificación con id ${id} no existe.`);

    //Verify permissions
    if (
      session.tipo != 'Administrador' &&
      session.sub != notificacion[0].usuario.id
    ) {
      throw new ForbiddenException(
        'El usuario no tiene permiso para realizar esta acción',
      );
    }
    return true;
  }
}
