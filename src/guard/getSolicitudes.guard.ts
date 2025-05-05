import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class GetSolicitudesGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const sessionToken: string = request.headers['sessiontoken'] as string;
        if (!sessionToken) {
            throw new UnauthorizedException(`No se ha enviado el token de sesión`);
        }

        let session;
        try {
            session = await this.jwtService.verifyAsync(sessionToken, {
                secret: process.env.SECRETTOKEN,
            });
        } catch (err) {
            throw new UnauthorizedException('Token de sesión inválido o expirado');
        }

        // If the user is not an administrator, filter by their ID
        if (session.tipo !== 'Administrador' && (!request.query.usuario || (request.query.usuario != session.sub))) {
            throw new ForbiddenException('Permisos insuficientes para obtener todos las solicitudes')
        }


        return true;

    }
}