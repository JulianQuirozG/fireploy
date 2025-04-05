import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async enviarCorreo(destinatario: string, asunto: string, mensajeHtml:string) {
    await this.mailerService.sendMail({
      to: destinatario,
      subject: asunto,
      html: mensajeHtml
    });
    return { message: 'Correo enviado con éxito' };
  }
}