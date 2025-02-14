import { Estudiante } from 'src/modelos/estudiante/entities/estudiante.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 50 })
  titulo: string;

  @Column({ length: 512 })
  descripcion: string;

  @Column({ type: 'float', precision: 2, scale: 1 })
  calificacion: number;

  @Column({ length: 256 })
  url: string;

  @Column({ length: 256 })
  imagen: string;

  @Column({ type: 'char', length: 1 })
  estado_proyecto: string;

  @Column({ nullable: false, type: 'char', length: 1 })
  estado_ejecucion: string;

  @ManyToMany(() => Estudiante, (estudiante) => estudiante.proyectos)
  estudiantes: Estudiante[];
}
