console.log('2-1');
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
console.log('2-2');
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

  @OneToMany(() => Solicitud, (solicitud) => solicitud.usuario, {
    cascade: true,
  })
  solicitudes: Solicitud[];

  @OneToMany(() => Solicitud, (solicitud) => solicitud.aprobado_by, {
    cascade: true,
  })
  solicitudes_pendientes: Solicitud[];

  @ManyToMany(() => Proyecto, (proyecto) => proyecto.estudiantes)
  @JoinTable()
  proyectos: Proyecto[];
}
