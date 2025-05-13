/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { EmailUpdatePasswordDto } from 'src/modelos/usuario/dto/email-update-password';
import { UpdatePasswordDto } from 'src/modelos/usuario/dto/update-password.dto';
import { UsuarioService } from 'src/modelos/usuario/usuario.service';
import { Encrypt } from 'src/utilities/hash/hash.encryption';
import { OAuth2Client } from 'google-auth-library';
import { LoginGoogleDto } from './dto/auth-google.dto';

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    private usuarioService: UsuarioService,
    private encrypt: Encrypt,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async signIn(
    correo: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usuarioService.findOneCorreo(correo);
    if (user?.estado == 'I') {
      throw new ForbiddenException(
        'El usuario no se encuentra activo, comuniquese con el administrador',
      );
    }
    const answer = await this.encrypt.compare(pass, user?.contrasenia);
    if (!answer) throw new UnauthorizedException('La información no coincide');
    const payload = { sub: user?.id, tipo: user?.tipo, correo: user?.correo };
    const response = {
      access_token: String(
        await this.jwtService.signAsync(payload, {
          secret: process.env.SECRETTOKEN,
        }),
      ),
      nombre: user?.nombre + ' ' + user?.apellido,
      tipo: user?.tipo,
      foto: user?.foto_perfil,
      id: user?.id,
    };
    return response;
  }

  async recoverPassword(correo: string): Promise<{ access_token: string }> {
    const user = await this.usuarioService.findOneCorreo(correo);
    if (user?.estado == 'I') {
      throw new ForbiddenException(
        'El usuario no se encuentra activo, comuniquese con el administrador',
      );
    }
    const payload = { sub: user?.id, tipo: user?.tipo, correo: user?.correo };
    const response = {
      access_token: String(
        await this.jwtService.signAsync(payload, {
          secret: process.env.SECRETTOKEN,
        }),
      ),
      nombre: user?.nombre + ' ' + user?.apellido,
      tipo: user?.tipo,
      foto: user?.foto_perfil,
      id: user?.id,
    };

    return response;
  }

  async changepasswordEmail(updateUsuarioDto: EmailUpdatePasswordDto) {
    const tokenResponse = await this.recoverPassword(updateUsuarioDto.correo);
    const resetUrl = `https://${process.env.URL}/reset-password?token=${tokenResponse.access_token}`;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT"
            crossorigin="anonymous"
          />
          <title>Mensaje Recuperar Contraseña</title>
        </head>
        <body>
          <div class="m-3 d-flex flex-column align-middle align-items-center">
            <div class="d-flex align-items-center align-content-center gap-2">
              <h1 class="d-inline m-0">Fireploy</h1>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="black"
                focusable="false"
                aria-hidden="true"
                style="width: 48px; height: 48px"
              >
                <path
                  d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12C4.42 15.34 5.17 15 6 15c1.66 0 3 1.34 3 3m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2"
                />
              </svg>
            </div>
            <div class="mb-3 mt-4 color-black border border-solid p-5 d-flex flex-column gap-4" style="max-width: 700px;">
              <h3>Hola Rodrigo Andrés 😄</h3>
              <p class="m-0">
                <strong
                  >Se ha recibido una solicitud de cambio de contraseña para tu cuenta de Fireploy</strong
                >
              </p>
              <div class="d-flex justify-content-center">
                <button type="button" class="btn btn-primary m-0"><a target="_blank" rel="noopener noreferrer" style="text-transform: none; text-decoration: none; color: white" href="${resetUrl}">Cambiar Contraseña</a></button>
              </div>
              <p class="m-0 text-body text-black">Si no realizaste esta petición, realiza caso omiso a este correo</p>
              <div><p class="m-0">Muchas gracias,</p>
              <p style="font-weight: 500;" class="m-0">Equipo de Fireploy</p></div>
            </div>
            <div><p>Copyright © 2025 <strong>Fireploy</strong>. All Rights Reserved.</p></div>
          </div>
        </body>
      </html>
    `;

    return this.mailService.enviarCorreo(
      updateUsuarioDto.correo,
      'Solicitud de cambio de contraseña',
      htmlTemplate,
    );
  }

  async changepassword(updateUsuarioDto: UpdatePasswordDto) {
    const user = await this.usuarioService.findOneCorreo(
      updateUsuarioDto.correo,
    );
    const contraseniahash = await this.encrypt.getHash(
      updateUsuarioDto.contrasenia,
    );
    if (user) {
      user.contrasenia = contraseniahash;

      return await this.usuarioService.update(user?.id, user);
    }
    throw new BadRequestException('El usuario no existe');
  }

  async loginWithGoogle({ idToken }: LoginGoogleDto) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Token sin payload válido.');
      }

      const { sub: googleId, email, name } = payload;

      if (!email) {
        throw new BadRequestException(
          'El token de Google no contiene el correo electrónico.',
        );
      }

      // 1. Buscar usuario existente
      let user, mensaje;
      try {
        user = await this.usuarioService.findOneCorreo(email);
        mensaje = 'Usario logueado con exito';
      } catch (error) {
        // 2. Si no existe, lo creamos
        user = await this.usuarioService.create({
          nombre: name ?? '',
          apellido: '',
          fecha_nacimiento: new Date(), // Esto lo puedes mejorar si tienes forma de obtenerla
          sexo: '',
          descripcion: '',
          correo: email,
          contrasenia: email, // Idealmente deberías tener otro sistema para evitar contraseñas visibles
          tipo: 'Estudiante',
          estado: '',
          red_social: 'Google',
          foto_perfil: payload.picture ?? '',
        });
        mensaje = 'Usario Registrado con exito';
        user = await this.usuarioService.findOneCorreo(email);
      }

      const payload2 = {
        sub: user?.id,
        tipo: user?.tipo,
        correo: user?.correo,
      };
      const response = {
        message: mensaje,
        access_token: String(
          await this.jwtService.signAsync(payload2, {
            secret: process.env.SECRETTOKEN,
          }),
        ),
        nombre: user?.nombre + ' ' + user?.apellido,
        tipo: user?.tipo,
        foto: user?.foto_perfil,
        id: user?.id,
      };
      return response;
      // 3. Aquí podrías generar y retornar un JWT si usas autenticación por token
    } catch (error) {
      // Manejo específico del error del tiempo del token
      if (error.message?.includes('Token used too late')) {
        throw new UnauthorizedException(
          'El token de Google ha expirado o tu reloj del sistema está desincronizado.',
        );
      }
      throw new BadRequestException('Error al validar el token de Google.');
    }
  }
}
