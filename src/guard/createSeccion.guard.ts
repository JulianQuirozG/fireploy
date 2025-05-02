import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CursoService } from 'src/modelos/curso/curso.service';
import { CreateSeccionDto } from 'src/modelos/seccion/dto/create-seccion.dto';

@Injectable()
export class CreateSeccionGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private cursoService: CursoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const { cursoId } = req.body as unknown as CreateSeccionDto;

    //Verify token exist
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new UnauthorizedException(`No se ha enviado el token de sesión`);
    let session;
    try {
      session = await this.jwtService.verifyAsync(sessionToken, {
        secret: process.env.SECRETTOKEN,
      });
    } catch (err) {
      throw new UnauthorizedException('Token de sesión inválido o expirado');
    }

    //Verify curso exists
    const curso = await this.cursoService.findOne(cursoId);
    if (!curso)
      throw new BadRequestException(
        `El curso al cual se quiere asignar la sección no existe`,
      );

    //Verify is estudiante
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (session.tipo == 'Estudiante')
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    //Verify docente is the curso'tutor
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      session.tipo == 'Docente' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (!curso.docente.id || curso.docente.id != session.sub)
    )
      throw new ForbiddenException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    return true;
  }
}
