import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GetSolicitudDto } from 'src/modelos/solicitud/dto/get-solicitud.dto';
import { SolicitudService } from 'src/modelos/solicitud/solicitud.service';
import { UsuarioService } from 'src/modelos/usuario/usuario.service';

@Injectable()
export class GetSolicitudByUserGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path.split('/').filter((segment) => segment !== '');

    // Obtener el token de sesión
    const sessionToken: string = request.headers['sessiontoken'] as string;
    if (!sessionToken) {
      throw new UnauthorizedException('No se ha enviado el token de sesión');
    }

    // Verificar el token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let session;
    try {
      session = await this.jwtService.verifyAsync(sessionToken, {
        secret: process.env.SECRETTOKEN,
      });
    } catch (err) {
      throw new UnauthorizedException('Token de sesión inválido o expirado');
    }

    const { id, tipo } =
      request.body as unknown as GetSolicitudDto;

    // Buscar solicitud
    const usuario = await this.usuarioService.findOne(+id,true);

    // Verificar permisos del usuario
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      session.tipo !== 'Administrador' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (session.id != session.sub)
    ) {
      throw new ForbiddenException(
        'El usuario no tiene permiso para realizar esta acción',
      );
    }

    return true;
  }
}
