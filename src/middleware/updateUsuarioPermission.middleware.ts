/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

//Middleware to create user permissions
@Injectable()
export class updateUsuarioPermissionMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const path = req.path.split('/').filter((segment) => segment !== '');

    //Verify tokenid and id is same
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new BadRequestException(`No se ha enviado el token de sesión`);

    //Verify permission token
    const session = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });
    let id;
    if (path.length > 0) {
      id = path[1];
    }
    //Verify estudiante get permissions
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (session.tipo == 'Estudiante' || session.tipo == 'Docente') &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (!id || id != session.sub)
    )
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esta acción`,
      );
    next();
  }
}
