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
import { CreateBaseDeDatoDto } from 'src/modelos/base_de_datos/dto/create-base_de_dato.dto';
import { CursoService } from 'src/modelos/curso/curso.service';
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';
import { SeccionService } from 'src/modelos/seccion/seccion.service';

@Injectable()
export class CreateDataBaseGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private cursoService: CursoService,
    private proyectoService: ProyectoService,
    private seccionService: SeccionService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = request.headers['sessiontoken'] as string;
    const { proyecto_id } = request.body as unknown as CreateBaseDeDatoDto;

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

    if (payload.tipo === 'Administrador') {
      return true;
    }
    const proyecto = await this.proyectoService.findOne(proyecto_id);
    const seccion = await this.seccionService.findOne(proyecto.seccion.id);
    const curso = await this.cursoService.findOne(seccion.curso.id);

    if ((proyecto.tutor && curso.docente.id && payload.tipo === 'Docente') && curso.docente.id === payload.sub) {
      return true;
    }

    if (!curso.estudiantes || curso.estudiantes.length === 0) {
      throw new ForbiddenException('El curso no tiene estudiantes registrados');
    }

    const estudianteEncontrado = curso.estudiantes.some((estudiante) => estudiante.id === payload.sub);
    if (!estudianteEncontrado) {
      throw new ForbiddenException('El usuario no pertenece a este curso');
    }

    const estudiantesCursoIds = proyecto.estudiantes.map((e) => e.id);
    const estudiantesValidos = estudiantesCursoIds.some((id) => id === payload.sub);

    if (!estudiantesValidos || payload.sub != proyecto.creador.id) {
      throw new ForbiddenException(
        `El estudiante no hace parte del proyecto`
      );
    }
    return true;
  }
}
