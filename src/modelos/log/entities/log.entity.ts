import { Repositorio } from 'src/modelos/repositorio/entities/repositorio.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fecha_registro: Date;

  @Column({ type: 'text', nullable: false })
  log: string;

  @ManyToOne(() => Repositorio, (repositorio) => repositorio.logs, {
    onDelete: 'SET NULL',
  })
  repositorio: Repositorio;
}
