import { Materia } from 'src/modelos/materia/entities/materia.entity';
import { Seccion } from 'src/modelos/seccion/entities/seccion.entity';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Curso {
  @PrimaryColumn({ nullable: false, length: 512 })
  id: string;

  @Column({ nullable: false, type: 'char', length: 1 })
  grupo: string;

  @Column({ nullable: false, length: 50 })
  semestre: string;

  @Column({ length: 512 })
  descripcion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.cursos_dirigidos, {
    onDelete: 'SET NULL',
  })
  docente: Usuario;

  @ManyToOne(() => Materia, (materia) => materia.cursos, {
    onDelete: 'SET NULL',
  })
  materia: Materia;

  @OneToMany(() => Seccion, (seccion) => seccion.curso)
  secciones: Seccion[];

  @ManyToMany(() => Usuario, (usuario) => usuario.cursos)
  estudiantes: Usuario[];

  @Column({ nullable: false, length: 1, type: 'char' })
  estado: string;
}
