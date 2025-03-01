import { IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class addEstudiantesCursoDto {
  @IsNotEmpty({ message: `Debes enviar al menos un id de estudiante` })
  estudiantes: number[];

  @MaxLength(1, { message: 'estado debe tener solo 1 carácter' })
  @IsIn(['A', 'D'], {
    message: 'estado debe ser "A" para agregar o "D" para eliminar',
  })
  operacion: string;
}
