import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken: string = request.headers['sessiontoken'] as string;

    if (!sessionToken) {
      throw new UnauthorizedException(
        'No se ha suministrado el token de sesión (sessiontoken)',
      );
    }

    try {
      await this.jwtService.verifyAsync(sessionToken, {
        secret: process.env.SECRETTOKEN,
      });

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException(
        'La sesión ha acabado o el token de sesión es inválido',
      );
    }
  }
}
