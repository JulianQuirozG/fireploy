/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';

//Middleware to create user permissions
@Injectable()
export class PueshRepositorioMiddleware implements NestMiddleware {
  constructor(
    private readonly zipDir = `${process.env.FOLDER_ROUTE_ZIP}`
  ) { }
  async use(req: Request, res: Response, next: NextFunction) {
    if (!fs.existsSync(this.zipDir)) {
      fs.mkdirSync(this.zipDir, { recursive: true });
      console.log(`Directorio ${this.zipDir} creado`);
    }

    // 2. Verificar archivo subido (solo si ya está presente en req.file)
    const file = (req as any).file;
    if (!file) {
      throw new BadRequestException('No se ha recibido ningún archivo');
    }

    const ext = path.extname(file.originalname);
    if (ext !== '.zip') {
      throw new BadRequestException('El archivo debe ser un .zip');
    }
    next();
  }
}
