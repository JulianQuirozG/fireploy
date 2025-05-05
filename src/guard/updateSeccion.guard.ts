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
import { CursoService } from 'src/modelos/curso/curso.service';
import { SeccionService } from 'src/modelos/seccion/seccion.service';

@Injectable()
export class updateSeccionGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private cursoService: CursoService,
    private seccionService: SeccionService,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    let id: number | undefined;
    
    if (path.length > 0) {
      id = path[1] as unknown as number;
    }
    console.log(id);
    //Verify valid id
    if (isNaN(Number(id)))
      throw new BadRequestException(
        `El id de la sección a editar no es valido`,
      );

    //Verify seccion exists
    const seccion = await this.seccionService.findOne(id as number);
    if (!seccion)
      throw new BadRequestException(`La sección a editar no existe`);

    const curso = await this.cursoService.findOne(seccion.curso.id);

    //Verify user is an estudiante
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (session.tipo == 'Estudiante')
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    //Verify docente is the curso'tutor
    if(session.tipo=='Administrador')
      return true

    if (!curso.docente ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (session.tipo == 'Docente' && curso.docente.id != session.sub)
    )
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    return true;
  }
}
