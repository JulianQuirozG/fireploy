import { Log } from 'src/modelos/log/entities/log.entity';
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Repositorio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 256 })
  url: string;

  @Column({ type: 'char', length: 1 })
  tipo: string;

  @Column({ nullable: true, length: 50 })
  tecnologia: string;

  @Column({ nullable: true, length: 2048 })
  variables_de_entorno: string;

  @Column({ nullable: true, length: 20 })
  framework: string;

  @Column({ nullable: true, length: 20 })
  version: string;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.repositorios, {
    onDelete: 'SET NULL',
  })
  proyecto_id: Proyecto;

  @OneToMany(() => Log, (log) => log.repositorio)
  logs: Log[];
}
