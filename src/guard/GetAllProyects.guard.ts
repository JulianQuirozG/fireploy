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
import { RequestProjectWithUser } from 'src/interfaces/request.proyect.interface';
import { CursoService } from 'src/modelos/curso/curso.service';
import { CreateProyectoDto } from 'src/modelos/proyecto/dto/create-proyecto.dto';
import { SeccionService } from 'src/modelos/seccion/seccion.service';

@Injectable()
export class GetAllProjectsGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService,
    private seccionService: SeccionService,
    private cursoService: CursoService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestProjectWithUser = context.switchToHttp().getRequest();
    const token = request.headers['sessiontoken'] as string;

    if (!token) {
      request.user = { isInProject: false };
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRETTOKEN,
      });

      // Aquí puedes enriquecer el request con lo que necesites
      request.user = {
        isInProject: 'Administrador' === String(payload.tipo), // o lógica más compleja
      };

      return true;
    } catch (err) {
      request.user = { isInProject: false };
      return true;
    }
  }
}
