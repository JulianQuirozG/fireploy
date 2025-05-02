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

@Injectable()
export class UpdateUserImageGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const path = req.path.split('/').filter((segment) => segment !== '');

    // Verify session token exists
    const sessionToken: string = req.headers['sessiontoken'] as string;
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

    let id;
    if (path.length > 0) {
      id = path[2];
    }

    // Verify estudiante or docente permissions
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (session.tipo == 'Estudiante' || session.tipo == 'Docente') &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (!id || id != session.sub)
    )
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esta acción`,
      );

    return true;
  }
}
