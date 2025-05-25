import { IsDefined, IsNotEmpty, IsNumber, isString, IsString } from "class-validator";
import { Repositorio } from "src/modelos/repositorio/entities/repositorio.entity";

export class CreateFicheroDto {

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    repositorio: string;

}
