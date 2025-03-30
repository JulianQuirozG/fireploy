/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
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
      throw new BadRequestException('No se ha enviado el token de sesión');
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
      throw new BadRequestException(
        `La sesion ha acabado o el token de sesión es invalido`,
      );
    }

    let id: number | undefined;
    if (path.length > 0) {
      id = path[1] as unknown as number;
    }

    //Verify valid id
    if (isNaN(Number(id)))
      throw new BadRequestException(
        `El id del repositorio a editar no es valido`,
      );

    //Verify repositorio exists
    const repositorio = await this.repositorioService.findOne(id as number);
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
      throw new BadRequestException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    return true;
  }
}
