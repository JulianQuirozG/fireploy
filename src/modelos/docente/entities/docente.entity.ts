//import { Curso } from 'src/modelos/curso/entities/curso.entity';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
import { ChildEntity } from 'typeorm';

@ChildEntity()
export class Docente extends Usuario {

}
