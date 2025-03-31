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
import { CreateSolicitudDto } from 'src/modelos/solicitud/dto/create-solicitud.dto';

@Injectable()
export class CreateSolicitudGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const token = request.headers['sessiontoken'] as string;
    const { usuario } = request.body as unknown as CreateSolicitudDto;

    if (!token) {
      throw new UnauthorizedException('No se ha suministrado el token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRETTOKEN,
      });

      request.user = { id: payload.sub };
      
      if (payload.sub != usuario) {
        throw new UnauthorizedException('El usuario id del token no coincide con el id del request');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
