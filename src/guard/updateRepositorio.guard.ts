/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';
import { RepositorioService } from 'src/modelos/repositorio/repositorio.service';

@Injectable()
export class updateRepositorioGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private repositorioService: RepositorioService,
    private proyectoService: ProyectoService,
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

    const { id } = request.params;

    //Verify repositorio exists
    const repositorio = await this.repositorioService.findOne(+id);
    if (!repositorio)
      throw new BadRequestException(`El repositorio a editar no existe`);

    const proyecto = await this.proyectoService.findOne(
      repositorio.proyecto_id.id,
    );

    //Verify user can update
    if (
      session.tipo != 'Administrador' &&
      proyecto.creador.id != session.sub &&
      proyecto.tutor.id != session.sub
    )
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    return true;
  }
}
