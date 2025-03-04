import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permitedRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const req: Request = context.switchToHttp().getRequest();

    //Validate session Token
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (!sessionToken)
      throw new ForbiddenException(`No se ha enviado el token de sesión`);
    let session;
    try {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!permitedRoles.includes(session.tipo as string)) {
      throw new ForbiddenException(`El usuario no tiene permiso de acceso`);
    }

    return true;
  }
}
