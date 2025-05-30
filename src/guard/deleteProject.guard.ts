/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/interfaces/request.interface';
import { CursoService } from 'src/modelos/curso/curso.service';
import { UpdateProyectoDto } from 'src/modelos/proyecto/dto/update-proyecto.dto';
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';
import { SeccionService } from 'src/modelos/seccion/seccion.service';

@Injectable()
export class DeleteProyectoGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private proyectoService: ProyectoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = request.headers['sessiontoken'] as string;
    //const { estudiantesIds } = request.body as unknown as UpdateProyectoDto;
    const { id } = request.params;

    if (!token) {
      throw new UnauthorizedException('No se ha suministrado el token');
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRETTOKEN,
      });
    } catch (err) {
      throw new UnauthorizedException('Token de sesión inválido o expirado');
    }

    request.user = { id: payload.sub };

    const proyecto = await this.proyectoService.findOne(+id);

    if (payload.tipo === 'Docente' && payload.sub != proyecto.creador.id ) {
      throw new ForbiddenException(
        'El usuario no tiene permiso para realizar esa acción.',
      );
    }

    if (payload.tipo === 'Estudiante' && proyecto.creador.id != payload.sub) {
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esa acción.`,
      );
    }

    return true;
  }
}
