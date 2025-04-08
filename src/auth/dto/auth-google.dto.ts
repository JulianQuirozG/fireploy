import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginGoogleDto {

  @IsNotEmpty({ message: 'grupo es obligatorio' })
  @IsString({ message: 'grupo debe ser una cadena de texto' })
  idToken: string;


}
