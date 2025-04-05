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
console.log("13")
@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private encrypt: Encrypt,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

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
    const payload = { sub: user?.id, tipo: user?.tipo };
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

  async recoverPassword(
    correo: string,
  ): Promise<{ access_token: string }> {
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
    const resetUrl = `${process.env.URL}/reset-password?token=${tokenResponse.access_token}`;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Recuperación de contraseña</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9fafb;
            color: #333;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .button {
            background-color: #e63946;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Hola 👋</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>FIREPLOY</strong>.</p>
          <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
          <a href="${resetUrl}" >${resetUrl}</a>
          <p>Si no realizaste esta solicitud, puedes ignorar este mensaje.</p>
          <div class="footer">
            &copy; 2025 FIREPLOY - Todos los derechos reservados
          </div>
        </div>
      </body>
      </html>
    `;

    return this.mailService.enviarCorreo(
      updateUsuarioDto.correo,
      'Solicitud de cambio de contraseña',
      htmlTemplate
    );
  }

  async changepassword(updateUsuarioDto: UpdatePasswordDto) {
    const user = await this.usuarioService.findOneCorreo(updateUsuarioDto.correo);
    const contraseniahash = await this.encrypt.getHash(updateUsuarioDto.contrasenia);
    if (user) {
      user.contrasenia = contraseniahash;

      return await this.usuarioService.update(user?.id, user);
    }
    throw new BadRequestException("El usuario no existe");
  }
}
