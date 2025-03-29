import { BaseDeDato } from 'src/modelos/base_de_datos/entities/base_de_dato.entity';
import { Repositorio } from 'src/modelos/repositorio/entities/repositorio.entity';
import { Seccion } from 'src/modelos/seccion/entities/seccion.entity';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 50 })
  titulo: string;

  @Column({ length: 512, nullable: true })
  descripcion: string;

  @Column({ type: 'float', precision: 2, scale: 1, nullable: true })
  calificacion: number;

  @Column({ length: 256, nullable: true })
  url: string;

  @Column({ length: 256, nullable: true })
  imagen: string;

  @Column({ type: 'char', length: 1, nullable: true })
  estado_proyecto: string;

  @Column({ nullable: false, type: 'char', length: 1 })
  estado_ejecucion: string;

  @Column({ nullable: true, unique:true })
  puerto: number;

  @ManyToMany(() => Usuario, (usuario) => usuario.proyectos)
  estudiantes: Usuario[];

  @ManyToOne(() => Seccion, (seccion) => seccion.proyectos, {
    onDelete: 'SET NULL',
  })
  seccion: Seccion;

  @ManyToOne(() => Usuario, (usuario) => usuario.proyectos_dirigidos, {
    onDelete: 'SET NULL',
  })
  tutor: Usuario;

  @OneToMany(() => Repositorio, (repositorio) => repositorio.proyecto_id)
  repositorios: Repositorio[];

  @OneToOne(() => BaseDeDato, (db) => db.proyecto)
  @JoinColumn()
  base_de_datos: BaseDeDato;

  @Column({ nullable: false })
  fecha_creacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.proyectosCreados, { onDelete: 'SET NULL' })
  creador: Usuario;
}
