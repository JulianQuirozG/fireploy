/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/interfaces/request.interface';
import { CursoService } from 'src/modelos/curso/curso.service';
import { CreateProyectoDto } from 'src/modelos/proyecto/dto/create-proyecto.dto';
import { UpdateProyectoDto } from 'src/modelos/proyecto/dto/update-proyecto.dto';
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';
import { SeccionService } from 'src/modelos/seccion/seccion.service';

@Injectable()
export class updateProyectoGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService,
    private seccionService: SeccionService,
    private cursoService: CursoService,
    private proyectoService: ProyectoService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = request.headers['sessiontoken'] as string;
    const { estudiantesIds } = request.body as unknown as UpdateProyectoDto;
    const { id } = request.params;

    if (!token) {
      throw new UnauthorizedException('No se ha suministrado el token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRETTOKEN,
      });

      request.user = { id: payload.sub };

      const proyecto = await this.proyectoService.findOne(+id)
      const seccion = await this.seccionService.findOne(proyecto.seccion.id);
      const curso = await this.cursoService.findOne(seccion.curso.id);


      if (payload.tipo === 'Docente' && proyecto.tutor.id != payload.sub) {
        throw new UnauthorizedException('El docente no es tutor del proyecto');
      }

      if (payload.tipo === 'Estudiante' && !curso.estudiantes || curso.estudiantes.length === 0) {
        throw new UnauthorizedException('El curso no tiene estudiantes registrados');
      }

      const estudianteEncontrado = curso.estudiantes.some((estudiante) => estudiante.id === payload.sub);
      if ( payload.tipo==='Estudiante' && !estudianteEncontrado) {
        throw new UnauthorizedException('El usuario no pertenece a este curso');
      }

      if (estudiantesIds?.length && estudiantesIds?.length > 0) {
        const estudiantesCursoIds = curso.estudiantes.map((e) => e.id);
        const estudiantesInvalidos = estudiantesIds.filter((id) => !estudiantesCursoIds.includes(id));

        if (estudiantesInvalidos.length > 0) {
          throw new UnauthorizedException(
            `Los siguientes estudiantes no pertenecen al curso: ${estudiantesInvalidos.join(', ')}`
          );
        }
      }


      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
