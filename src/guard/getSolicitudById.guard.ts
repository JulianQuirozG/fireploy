import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SolicitudService } from 'src/modelos/solicitud/solicitud.service';

@Injectable()
export class GetSolicitudByIdGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private solicitudService: SolicitudService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path.split('/').filter((segment) => segment !== '');

    // Obtener el token de sesión
    const sessionToken: string = request.headers['sessiontoken'] as string;
    if (!sessionToken) {
      throw new BadRequestException('No se ha enviado el token de sesión');
    }

    // Verificar el token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const session = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    let id: string = '';
    if (path.length > 0) {
      id = path[1];
    }

    // Buscar solicitud
    const solicitud = await this.solicitudService.findOne(+id);

    // Verificar permisos del usuario
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      session.tipo !== 'Administrador' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (!id || solicitud.usuario.id != session.sub)
    ) {
      throw new BadRequestException(
        'El usuario no tiene permiso para realizar esta acción',
      );
    }

    return true;
  }
}
