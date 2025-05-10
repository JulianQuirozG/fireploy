import { Curso } from 'src/modelos/curso/entities/curso.entity';
import { Notificacione } from 'src/modelos/notificaciones/entities/notificacione.entity';
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
import { Solicitud } from 'src/modelos/solicitud/entities/solicitud.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

@Entity()
@TableInheritance({
  column: { type: 'varchar', name: 'tipo', nullable: false, length: 13 },
})
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  nombre: string;

  @Column({ length: 50, nullable: false })
  apellido: string;

  @Column({ nullable: false })
  fecha_nacimiento: Date;

  @Column({ type: 'char', length: 1, nullable: false })
  sexo: string;

  @Column({ length: 512, nullable: true })
  descripcion: string;

  @Column({ length: 50, unique: true, nullable: false })
  correo: string;

  @Column({ length: 512, nullable: false })
  contrasenia: string;

  @Column({ type: 'char', length: 1, nullable: false })
  estado: string = 'A';

  @Column({ length: 256, nullable: true })
  red_social: string;

  @Column({ length: 256, nullable: true })
  foto_perfil: string;

  @Column({ type: 'varchar', name: 'tipo', nullable: false, length: 13 })
  tipo: string;

  @Column({ nullable: true })
  est_fecha_inicio: Date;

  @OneToMany(() => Solicitud, (solicitud) => solicitud.usuario, {
    cascade: true,
  })
  solicitudes: Solicitud[];

  @OneToMany(() => Solicitud, (solicitud) => solicitud.aprobado_by, {
    cascade: true,
  })
  solicitudes_pendientes: Solicitud[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.creador)
  proyectosCreados: Proyecto[];

  @OneToMany(() => Notificacione, (notificaciones) => notificaciones.usuario)
  notificaciones: Notificacione[];

  @ManyToMany(() => Proyecto, (proyecto) => proyecto.estudiantes)
  @JoinTable()
  proyectos: Proyecto[];

  @ManyToMany(() => Curso, (curso) => curso.estudiantes)
  @JoinTable()
  cursos: Curso[];

  @OneToMany(() => Curso, (curso) => curso.docente)
  cursos_dirigidos: Curso[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.tutor)
  proyectos_dirigidos: Proyecto[];

  @ManyToMany(() => Proyecto, (proyecto) => proyecto.fav_usuarios)
  @JoinTable()
  proyectos_fav: Proyecto[];
}
