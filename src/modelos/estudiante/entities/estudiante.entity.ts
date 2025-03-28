console.log('6-0');
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
console.log('6-1');
import { Curso } from 'src/modelos/curso/entities/curso.entity';
console.log('6-2');
import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm';

@ChildEntity()
export class Estudiante extends Usuario {
  @Column({ nullable: false })
  est_fecha_inicio: Date;

  @ManyToMany(() => Curso, (curso) => curso.estudiantes)
  @JoinTable()
  cursos: Curso[];
}
