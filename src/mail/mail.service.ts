import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fireployvm@gmail.com',
        pass: 'vhwb ulny tdcq bxtw', // App Password de Gmail
      },
    });
  }

  async enviarCorreo(to: string, subject: string, html: string) {
    try{
      const info = await this.transporter.sendMail({
      from: '"Soporte Fireploy" <fireployvm@gmail.com>',
      to,
      subject,
      html,
    });

    return { message: 'Correo enviado con éxito' };
    } catch (e){
    throw new BadRequestException(`Error al enviar correo: ${e.message}`);
    }
    
  }
}
