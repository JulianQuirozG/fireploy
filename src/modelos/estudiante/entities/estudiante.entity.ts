import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
import { Usuario } from 'src/modelos/usuario/entities/usuario.entity';
import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm';

@ChildEntity()
export class Estudiante extends Usuario {
  @Column({ nullable: false })
  est_fecha_inicio: Date;

  @ManyToMany(() => Proyecto, (proyecto) => proyecto.estudiantes)
  @JoinTable()
  proyectos: Proyecto[];
}
