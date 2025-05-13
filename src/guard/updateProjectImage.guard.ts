import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RequestWithUser } from 'src/interfaces/request.interface';
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';

@Injectable()
export class UpdateProjectImageGuard implements CanActivate {
  constructor(private jwtService: JwtService,
    private proyectoService: ProyectoService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const sessionToken = request.headers['sessiontoken'] as string;
    const { id } = request.params;

    if (!sessionToken) {
      throw new UnauthorizedException('No se ha suministrado el token');
    }

    // Verify session token exists
    if (!sessionToken)
      throw new UnauthorizedException(`No se ha enviado el token de sesión`);

    // Verify permission token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let session;
    try {
      session = await this.jwtService.verifyAsync(sessionToken, {
        secret: process.env.SECRETTOKEN,
      });
    } catch (err) {
      throw new UnauthorizedException('Token de sesión inválido o expirado');
    }


    const proyecto = await this.proyectoService.findOne(+id);

    // Verify estudiante or docente permissions
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (session.tipo == 'Estudiante') &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (!proyecto.creador.id || proyecto.creador.id != session.sub)
    )
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esta acción`,
      );

        if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (session.tipo == 'Docente') &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (!proyecto.tutor.id || proyecto.tutor.id != session.sub)
    )
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esta acción`,
      );

    return true;
  }
}
