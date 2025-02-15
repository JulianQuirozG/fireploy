import { Curso } from 'src/modelos/curso/entities/curso.entity';
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Seccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 50 })
  titulo: string;

  @Column({ nullable: false, length: 512 })
  descripcion: string;

  @Column({ nullable: false })
  fecha_inicio: Date;

  @Column({ nullable: false })
  fecha_fin: Date;

  @ManyToOne(() => Curso, (curso) => curso.secciones, {
    onDelete: 'SET NULL',
  })
  curso: Curso;

  @OneToMany(() => Proyecto, (proyecto) => proyecto.seccion)
  proyectos: Proyecto[];

  @Column({ nullable: false, length: 1, type: 'char' })
  estado: string;
}
