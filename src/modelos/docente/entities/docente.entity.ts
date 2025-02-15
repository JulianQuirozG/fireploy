//import { Curso } from 'src/modelos/curso/entities/curso.entity';
import { Curso } from 'src/modelos/curso/entities/curso.entity';
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
import { ChildEntity, OneToMany } from 'typeorm';

@ChildEntity()
export class Docente extends Usuario {
  @OneToMany(() => Curso, (curso) => curso.docente)
  cursos: Curso[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.tutor)
  proyectos: Proyecto[];
}
