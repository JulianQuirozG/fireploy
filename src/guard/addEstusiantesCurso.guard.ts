/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DocenteService } from 'src/modelos/docente/docente.service';

@Injectable()
export class AddEstudianteCursoGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private docenteService: DocenteService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path.split('/').filter((segment) => segment !== '');
    // Obtener el token de sesión
    const sessionToken: string = request.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new BadRequestException(`No se ha enviado el token de sesión`);

    // Verificar el token
    const session = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    // Obtener el ID del curso desde los headers
    let cursoId: string | undefined;
    if (path.length > 0) {
      cursoId = path[2];
    }

    const { estudiantes } = request.body;

    if (!cursoId)
      throw new BadRequestException(`No se ha enviado el ID del curso`);

    // Validaciones según el tipo de usuario
    if (session.tipo === 'Estudiante') {
      // El estudiante solo puede agregar su propio ID
      if (estudiantes.length !== 1 || estudiantes[0] !== session.sub) {
        throw new ForbiddenException(
          `El usuario no tiene permiso para registrar / eliminar esos usuarios a un curso`,
        );
      }
    } else if (session.tipo === 'Docente') {
      // Buscar los cursos que tiene asignado el docente
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const docente = await this.docenteService.findOne(session.sub);

      // Verificar si el curso al que intenta agregar estudiantes está en su lista de cursos asignados
      const cursosAsignados = docente.cursos_dirigidos.map((curso) => curso.id);
      if (!cursosAsignados.includes(cursoId)) {
        throw new ForbiddenException(
          `El usuario no tiene permiso para registrar / eliminar esos usuarios a ese curso`,
        );
      }
    }

    return true;
  }
}
