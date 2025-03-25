//import { Docente } from 'src/modelos/docente/entities/docente.entity';
import { Docente } from 'src/modelos/docente/entities/docente.entity';
import { Estudiante } from 'src/modelos/estudiante/entities/estudiante.entity';
import { Materia } from 'src/modelos/materia/entities/materia.entity';
import { Seccion } from 'src/modelos/seccion/entities/seccion.entity';
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

  @ManyToOne(() => Docente, (docente) => docente.cursos_dirigidos, {
    onDelete: 'SET NULL',
  })
  docente: Docente;

  @ManyToOne(() => Materia, (materia) => materia.cursos, {
    onDelete: 'SET NULL',
  })
  materia: Materia;

  @OneToMany(() => Seccion, (seccion) => seccion.curso)
  secciones: Seccion[];

  @ManyToMany(() => Estudiante, (estudiante) => estudiante.cursos)
  estudiantes: Estudiante[];

  @Column({ nullable: false, length: 1, type: 'char' })
  estado: string;
}
