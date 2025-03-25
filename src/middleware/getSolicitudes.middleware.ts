/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class GetSolicitudesMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (!sessionToken) {
      throw new BadRequestException(`No se ha enviado el token de sesión`);
    }

    // Verify the token
    const session = await this.jwtService.verifyAsync(sessionToken, {
      secret: process.env.SECRETTOKEN,
    });

    // If the user is not an administrator, filter by their ID

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (session.tipo !== 'Administrador') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.query.usuario = session.sub.toString();
    }

    next();
  }
}
