//import { Docente } from 'src/modelos/docente/entities/docente.entity';
import { Docente } from 'src/modelos/docente/entities/docente.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'char', length: 1 })
  grupo: string;

  @Column({ length: 512 })
  descripcion: string;
  @ManyToOne(() => Docente, (docente) => docente.cursos, {
    onDelete: 'SET NULL',
  })
  docente: Docente;
}
