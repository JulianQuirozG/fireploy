import { Body, Controller, Post, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';
import { EmailUpdatePasswordDto } from 'src/modelos/usuario/dto/email-update-password';
import { UpdatePasswordDto } from 'src/modelos/usuario/dto/update-password.dto';
import { ForGetPasswordGuard } from 'src/guard/forgetPassword.guard';
import { RecoverPasswordGuard } from 'src/guard/recoverPassword.guard';
import { LoginGoogleDto } from './dto/auth-google.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('recover')
  @Public()
  async recoverPassword(@Body() updateUsuarioDto: EmailUpdatePasswordDto) {
    return this.authService.changepasswordEmail(updateUsuarioDto);
  }

  @Post('changePassword/:token')
  @Public()
  @UseGuards(ForGetPasswordGuard)
  async forgetPassword(@Param('token') token: string, @Body() updateUsuarioDto: UpdatePasswordDto) {
    return this.authService.changepassword(updateUsuarioDto);
  }

  @Post('updatePassword')
  @UseGuards(RecoverPasswordGuard)
  async updatePassword(@Body() updateUsuarioDto: UpdatePasswordDto) {
    return this.authService.changepassword(updateUsuarioDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('loginGoogle')
  @Public()
  signInWithGoogle(@Body() idToken: LoginGoogleDto) {
    return this.authService.loginWithGoogle(idToken);
  }
}
