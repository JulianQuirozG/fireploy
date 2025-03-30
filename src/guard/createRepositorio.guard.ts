/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProyectoService } from 'src/modelos/proyecto/proyecto.service';
import { CreateRepositorioDto } from 'src/modelos/repositorio/dto/create-repositorio.dto';

@Injectable()
export class CreateRepositorioGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private proyectoService: ProyectoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const { proyecto_id, tipo } = req.body as unknown as CreateRepositorioDto;

    //Verify token exist
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new BadRequestException(`No se ha enviado el token de sesión`);
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

    //Verify proyecto exists
    const proyecto = await this.proyectoService.findOne(proyecto_id);
    if (!proyecto)
      throw new BadRequestException(
        `El proyecto al que se quiere asignar el repositorio no existe.`,
      );

    //Verify user permision
    if (
      session.tipo != 'Administrador' &&
      proyecto.creador.id != session.sub &&
      proyecto.tutor.id != session.sub
    )
      throw new BadRequestException(
        `El usuario no tiene permiso para realizar esa acción`,
      );

    //Verify proyect type
    if (proyecto.tipo_proyecto == 'S') {
      //verify repositorio amount
      if (proyecto.repositorios.length == 2)
        throw new BadRequestException(`El proyecto no acepta más repositorios`);

      //Verify repositorios type
      if (
        proyecto.repositorios.length != 0 &&
        proyecto.repositorios[0].tipo == tipo
      )
        throw new BadRequestException(
          `El proyecto no acepta más repositorios tipo ${tipo}`,
        );
    } else {
      if (proyecto.repositorios.length != 0)
        throw new BadRequestException(`El proyecto no acepta más repositorios`);
    }

    return true;
  }
}
