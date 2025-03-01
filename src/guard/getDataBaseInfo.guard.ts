import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { BaseDeDatosService } from 'src/modelos/base_de_datos/base_de_datos.service';
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';

@Injectable()
export class GetDataBaseGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private baseDeDatoService: BaseDeDatosService,
    private proyectoService: ProyectoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path.split('/').filter((segment) => segment !== '');

    // get sessiontoken
    const sessionToken: string = request.headers['sessiontoken'] as string;
    if (!sessionToken) {
      throw new BadRequestException('No se ha enviado el token de sesión');
    }

    // Verify sessiontoken
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const session = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    let id: string | undefined = '';
    if (path.length > 0) {
      id = path[1];
    }

    //Verify user permissions of data base
    const baseDeDatos = await this.baseDeDatoService.findOne(+id);
    const proyecto = await this.proyectoService.findOne(
      baseDeDatos.proyecto.id,
    );

    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      session.tipo != 'Administrador' &&
      !proyecto?.estudiantes.some(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (estudiante) => estudiante.id == session.sub,
      ) &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      proyecto?.tutor.id != session.sub
    ) {
      throw new UnauthorizedException(
        'El usuario no tiene permiso para realizar esta acción',
      );
    }
    return true;
  }
}
