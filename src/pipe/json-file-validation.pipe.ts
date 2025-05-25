import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { basename, extname } from 'path';

@Injectable()
export class JsonFileValidationPipe implements PipeTransform {
    transform(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se envió ningún archivo');
        }

        const baseName = basename(file.originalname).toLowerCase();

        const isJson = baseName.endsWith('.json');
        const isEnv = baseName.startsWith('.env');
        if (!isJson && !isEnv) {
            throw new BadRequestException('Solo se permiten archivos .json o que comiencen con .env');
        }

        return file;
    }
}
