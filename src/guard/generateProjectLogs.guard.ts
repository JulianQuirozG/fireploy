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
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';

@Injectable()
export class GenerateProjectLogsGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private proyectoService: ProyectoService,
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
      id = path[2];
    }

    //get project
    const project = await this.proyectoService.findOne(+id);
    if (!project)
      throw new NotFoundException(`El proyecto con id ${id} no existe.`);

    //Verify permissions
    if (session.tipo === 'Docente' && project.tutor.id != session.sub) {
      throw new ForbiddenException('El docente no es tutor del proyecto');
    }

    if (session.tipo == 'Estudiante') {
      let permission = project.creador.id == session.sub;
      const estudiantesIds = project.estudiantes.map(
        (estudiante) => estudiante.id,
      );
      permission = permission || estudiantesIds.some((id) => id == session.sub);
      if (!permission)
        throw new ForbiddenException(
          'El usuario no tiene permiso para realizar esta acción',
        );
    }
    return true;
  }
}
