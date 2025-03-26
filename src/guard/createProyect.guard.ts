import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/interfaces/request.interface';


@Injectable()
export class ExtractUserIdGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: RequestWithUser = context.switchToHttp().getRequest();
        const token = request.headers['sessiontoken'] as string;;
 
        if (!token) {
            throw new UnauthorizedException('No se ha suministrado el token');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.SECRETTOKEN,
            });

            request.user = { id: payload.sub };  // Guarda el ID en el request
            console.log( payload.sub)
            console.log( request.user)
            return true;
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }
}
