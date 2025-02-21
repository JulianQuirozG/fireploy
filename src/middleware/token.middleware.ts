import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

//Middleware to verify session
@Injectable()
export class tokenMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const sessionToken: string = req.headers['sessiontoken'] as string;
    if (sessionToken) {
      try {
        void ((await this.jwtService.verifyAsync(sessionToken, {
          secret: process.env.SECRETTOKEN,
        })) as Promise<any>);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new BadRequestException(
          `La sesión ha acabado, vuelva a logearse`,
        );
      }
    } else {
      throw new BadRequestException(
        `No se ha suministrado el token de sesion (sessiontoken)`,
      );
    }
    next();
  }
}
