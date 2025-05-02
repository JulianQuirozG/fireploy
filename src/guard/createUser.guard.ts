import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from 'src/modelos/usuario/dto/create-usuario.dto';

@Injectable()
export class CreateUserGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const { tipo } = req.body as unknown as CreateUsuarioDto;

    //Veriry create a student
    if (tipo == 'Estudiante') return true;

    //Verify token exist
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new UnauthorizedException(`No se ha enviado el token de sesión`);
    let session;
    try {
      //Verify permission token
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      session = await this.jwtService.verifyAsync(sessionToken, {
        secret: process.env.SECRETTOKEN,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException(
        `La sesion ha acabado o el token de sesión es invalido`,
      );
    }

    //Verify create docente and admin permission
    if (
      (tipo == 'Docente' || tipo == 'Administrador') &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      session.tipo != 'Administrador'
    )
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    return true;
  }
}
