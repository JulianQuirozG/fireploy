/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/interfaces/request.interface';
import { CursoService } from 'src/modelos/curso/curso.service';
import { CreateProyectoDto } from 'src/modelos/proyecto/dto/create-proyecto.dto';
import { SeccionService } from 'src/modelos/seccion/seccion.service';

@Injectable()
export class ExtractUserIdGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService,
    private seccionService: SeccionService,
    private cursoService: CursoService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = request.headers['sessiontoken'] as string;
    const { seccionId, tutorId, estudiantesIds } = request.body as unknown as CreateProyectoDto;

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

    const seccion = await this.seccionService.findOne(seccionId);
    const curso = await this.cursoService.findOne(seccion.curso.id);

    if(!curso.docente){
      throw new BadRequestException('El curso no cuenta con un tutor asignado');
    }

    if ((payload.tipo === 'Docente') && curso.docente.id === payload.sub) {
      return true;
    }

    if (!curso.estudiantes || curso.estudiantes.length === 0) {
      throw new ForbiddenException('El curso no tiene estudiantes registrados');
    }

    const estudianteEncontrado = curso.estudiantes.some((estudiante) => estudiante.id === payload.sub);
    if (!estudianteEncontrado) {
      throw new ForbiddenException('El usuario no pertenece a este curso');
    }

    if (estudiantesIds?.length && estudiantesIds?.length > 0) {
      const estudiantesCursoIds = curso.estudiantes.map((e) => e.id);
      const estudiantesInvalidos = estudiantesIds.filter((id) => !estudiantesCursoIds.includes(id));

      if (estudiantesInvalidos.length > 0) {
        throw new ForbiddenException(
          `Los siguientes estudiantes no pertenecen al curso: ${estudiantesInvalidos.join(', ')}`
        );
      }
    }


    return true;
  }
}
