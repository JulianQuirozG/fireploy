import { BaseDeDato } from 'src/modelos/base_de_datos/entities/base_de_dato.entity';
console.log('3-1');
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
console.log('3-2');
import { Docente } from 'src/modelos/docente/entities/docente.entity';
console.log('3-3');
import { Repositorio } from 'src/modelos/repositorio/entities/repositorio.entity';
console.log('3-4');
import { Seccion } from 'src/modelos/seccion/entities/seccion.entity';
console.log('3-5');
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

  @ManyToMany(() => Usuario, (estudiante) => estudiante.proyectos)
  estudiantes: Usuario[];

  @ManyToOne(() => Seccion, (seccion) => seccion.proyectos, {
    onDelete: 'SET NULL',
  })
  seccion: Seccion;

  @ManyToOne(() => Docente, (docente) => docente.proyectos_dirigidos, {
    onDelete: 'SET NULL',
  })
  tutor: Docente;

  @OneToMany(() => Repositorio, (repositorio) => repositorio.proyecto_id)
  repositorios: Repositorio[];

  @OneToOne(() => BaseDeDato, (db) => db.proyecto)
  @JoinColumn()
  base_de_datos: BaseDeDato;

  @Column({ nullable: false })
  fecha_creacion: Date;
}
