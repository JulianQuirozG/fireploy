import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'fireployvm@gmail.com',
          pass: 'vhwb ulny tdcq bxtw',
        },
      },
      defaults: {
        from: '"Soporte Fireploy" <fireployvm@gmail.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
