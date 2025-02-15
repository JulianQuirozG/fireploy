import { Curso } from 'src/modelos/curso/entities/curso.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Materia {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: false, length: 50 })
  nombre: string;

  @Column({ nullable: false, length: 5 })
  semestre: string;

  @OneToMany(() => Curso, (curso) => curso.docente)
  cursos: Curso[];

  @Column({ nullable: false, length: 1, type: 'char' })
  estado: string;
}
