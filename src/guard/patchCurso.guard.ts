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
import { CursoService } from 'src/modelos/curso/curso.service';

@Injectable()
export class CreateCursoPermissionGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private cursoService: CursoService,
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

    let id: string | undefined;
    if (path.length > 0) {
      id = path[1];
    }

    const curso = await this.cursoService.findOne(id as string);

    // Verificar permisos del usuario
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (session.tipo === 'Administrador' || curso.docente.id == session.sub) {
      return true;
    }

    throw new ForbiddenException(
      'El usuario no tiene permiso para realizar esta acción',
    );
  }
}
