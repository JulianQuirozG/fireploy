import { Repositorio } from 'src/modelos/repositorio/entities/repositorio.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['nombre', 'repositorio'])
export class Fichero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'blob', nullable: true })
  contenido: Buffer | string;

  @ManyToOne(() => Repositorio, (repositorio) => repositorio.ficheros, {
    onDelete: 'CASCADE',
  })
  repositorio: Repositorio;
}
