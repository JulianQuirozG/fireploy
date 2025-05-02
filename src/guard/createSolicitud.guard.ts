/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/interfaces/request.interface';
import { CursoService } from 'src/modelos/curso/curso.service';
import { CreateSolicitudDto } from 'src/modelos/solicitud/dto/create-solicitud.dto';
import { Solicitud } from 'src/modelos/solicitud/entities/solicitud.entity';
import { SolicitudService } from 'src/modelos/solicitud/solicitud.service';
import { UsuarioService } from 'src/modelos/usuario/usuario.service';

@Injectable()
export class CreateSolicitudGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private cursoService: CursoService,
    private usuarioService: UsuarioService,
    private solicitudService: SolicitudService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = request.headers['sessiontoken'] as string;
    const { usuario, cursoId, tipo_solicitud } =
      request.body as unknown as CreateSolicitudDto;

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
    const user = await this.usuarioService.findOne(usuario, true);
    if (payload.sub != usuario) {
      throw new UnauthorizedException(
        'El usuario id del token no coincide con el id del request',
      );
    }

    let solicitudes_pendientes: Solicitud[];
    if (!user)
      throw new NotFoundException(
        `El usuario con el id ${usuario} no existe`,
      );

    if (tipo_solicitud == 1) {
      if (user.tipo == 'Docente')
        throw new NotFoundException(`El usuario ya es un docente`);
      solicitudes_pendientes = await this.solicitudService.findAll({
        usuario: user.id,
        estado: 'P',
        tipo_solicitud: 1,
      });
    } else {
      if (user.tipo == 'Estudiante')
        throw new NotFoundException(
          `Un estudiante no puede solicitar ser tutor de un cruso, solicite ser docente primero.`,
        );

      if (!cursoId)
        throw new NotFoundException(
          `No se ha enviado el codigo del curso del que se quiere ser docente.`,
        );

      const curso = await this.cursoService.findOne(cursoId);

      if (!curso)
        throw new NotFoundException(
          `El curso del que solicita ser docente no existe.`,
        );

      if (curso.docente)
        throw new NotFoundException(
          `El curso del que solicita ser docente ya esta asignado.`,
        );

      solicitudes_pendientes = await this.solicitudService.findAll({
        usuario: user.id,
        estado: 'P',
        tipo_solicitud: 2,
        curso: curso.id,
      });
    }

    if (solicitudes_pendientes && solicitudes_pendientes.length > 0) {
      throw new BadRequestException(
        'El usuario ya tiene solicitudes pendientes.',
      );
    }

    return true;
  }
}
