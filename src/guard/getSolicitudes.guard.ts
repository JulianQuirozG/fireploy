import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    BadRequestException,
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
            throw new BadRequestException(`No se ha enviado el token de sesión`);
        }

        try {
            // Verify the token
            const session = await this.jwtService.verifyAsync(sessionToken, {
                secret: process.env.SECRETTOKEN,
            });

            // If the user is not an administrator, filter by their ID
            if (session.tipo !== 'Administrador' && (!request.query.usuario || (request.query.usuario != session.sub))) {
                throw new UnauthorizedException('Permisos insuficientes para obtener todos las solicitudes')
            }


            return true;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('El token ha expirado, inicie sesión nuevamente.');
            }
            throw new UnauthorizedException('Token inválido.');
        }
    }
}