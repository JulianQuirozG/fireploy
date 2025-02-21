/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { CreateUsuarioDto } from 'src/modelos/usuario/dto/create-usuario.dto';

//Middleware to create user permissions
@Injectable()
export class createUsuarioPermissionsMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const { tipo } = req.body as CreateUsuarioDto;

    //Verify token exist
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new BadRequestException(`No se ha enviado el token de sesión`);

    //Verify permission token
    const sessionType = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    //Veriry create a student
    if (tipo == 'Estudiante') return next();

    //Verify create docente permission
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!sessionType.tipo || sessionType.tipo == 'Estudiante')
      throw new BadRequestException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    //Verify create admin permission
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (tipo == 'Administrador' && sessionType.tipo != 'Administrador')
      throw new BadRequestException(
        `El usuario no tiene permiso para realizar esa acción`,
      );
    next();
  }
}
