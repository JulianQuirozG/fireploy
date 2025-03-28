console.log('4-0');
import { Curso } from 'src/modelos/curso/entities/curso.entity';
console.log('4-1');
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
console.log('4-2');
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
console.log('4-3');
import { ChildEntity, OneToMany } from 'typeorm';

@ChildEntity()
export class Docente extends Usuario {
  @OneToMany(() => Curso, (curso) => curso.docente)
  cursos_dirigidos: Curso[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.tutor)
  proyectos_dirigidos: Proyecto[];
}
