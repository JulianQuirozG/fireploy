console.log('5-0');
import { Docente } from 'src/modelos/docente/entities/docente.entity';
console.log('5-1');
import { Estudiante } from 'src/modelos/estudiante/entities/estudiante.entity';
console.log('5-2');
import { Materia } from 'src/modelos/materia/entities/materia.entity';
console.log('5-3');
import { Seccion } from 'src/modelos/seccion/entities/seccion.entity';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
console.log('5-4');
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

  @ManyToMany(() => Usuario, (estudiante) => estudiante.cursos)
  estudiantes: Usuario[];

  @Column({ nullable: false, length: 1, type: 'char' })
  estado: string;
}
