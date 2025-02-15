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
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'char', length: 1 })
  grupo: string;

  @Column({ length: 512 })
  descripcion: string;

  @ManyToOne(() => Docente, (docente) => docente.cursos, {
    onDelete: 'SET NULL',
  })
  docente: Docente;

  @ManyToOne(() => Materia, (materia) => materia.cursos, {
    onDelete: 'SET NULL',
  })
  materia: Docente;

  @OneToMany(() => Seccion, (seccion) => seccion.curso_id)
  secciones: Seccion[];

  @ManyToMany(() => Estudiante, (estudiante) => estudiante.cursos)
  estudiantes: Estudiante[];
}
