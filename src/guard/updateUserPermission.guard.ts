import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UpdateUserPermissionGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const path = req.path.split('/').filter((segment) => segment !== '');

    // Verify session token exists
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new BadRequestException(`No se ha enviado el token de sesión`);

    // Verify permission token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const session = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    let id;
    if (path.length > 0) {
      id = path[1];
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
