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

 /**
 * Generates a password recovery token (JWT) for a user by email.
 * 
 * This method:
 * 1. Validates if the user exists and is active.
 * 2. Constructs a JWT payload with the user's ID, type, and email.
 * 3. Signs the payload asynchronously to generate an access token.
 * 4. Returns user metadata along with the access token.
 * 
 * @param correo - The email address of the user requesting password recovery.
 * @returns A Promise that resolves to an object containing the JWT token and user data.
 * 
 * @throws ForbiddenException - If the user is inactive.
 * @throws NotFoundException - If the user does not exist.
 */
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

/**
 * Sends a password reset email to a user.
 * 
 * This method:
 * 1. Generates a JWT token for password reset using the user's email.
 * 2. Constructs a secure reset password URL with the token.
 * 3. Builds a styled HTML email template using Bootstrap.
 * 4. Sends the email to the user via the MailService.
 * 
 * @param updateUsuarioDto - DTO containing the user's email.
 * @returns A promise with the result of the email sending process.
 * 
 * @throws ForbiddenException - If the user is inactive.
 * @throws NotFoundException - If the user does not exist.
 */
  async changepasswordEmail(updateUsuarioDto: EmailUpdatePasswordDto) {
    const tokenResponse = await this.recoverPassword(updateUsuarioDto.correo);
    const resetUrl = `https://${process.env.URL}/reset-password/?token=${tokenResponse.access_token}`;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Recuperar Contraseña</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="margin: 0;">Fireploy 🔥</h1>
            </td>
          </tr>
          <tr>
            <td>
              <h3 style="color: #333333;">Hola 😄</h3>
              <p><strong>Se ha recibido una solicitud de cambio de contraseña para tu cuenta de Fireploy.</strong></p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" target="_blank" style="background-color: #0d6efd; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block;">Cambiar Contraseña</a>
              </div>
              <p style="color: #6c757d;">Si no realizaste esta petición, ignora este correo.</p>
              <p>Muchas gracias,<br><strong>Equipo de Fireploy</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 12px; color: #adb5bd; padding-top: 20px;">
              © 2025 Fireploy. Todos los derechos reservados.
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

    return this.mailService.enviarCorreo(
      updateUsuarioDto.correo,
      'Solicitud de cambio de contraseña',
      htmlTemplate,
    );
  }

  /**
 * Updates the user's password by hashing the new one and saving it in the database.
 *
 * @param updateUsuarioDto - Object containing the user's email and new password.
 * @returns A Promise that resolves with the updated user object.
 *
 * @throws BadRequestException - If the user does not exist.
 */
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

  /**
 * Logs in a user using their Google ID token. If the user does not exist, it creates a new one.
 *
 * @param LoginGoogleDto - Object containing the Google ID token.
 * @returns A JWT token and user data upon successful login or registration.
 *
 * @throws UnauthorizedException - If the token is invalid or expired.
 * @throws BadRequestException - If the token does not contain an email or if any processing error occurs.
 */
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
