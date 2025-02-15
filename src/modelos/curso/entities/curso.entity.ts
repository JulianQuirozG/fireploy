//import { Docente } from 'src/modelos/docente/entities/docente.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'char', length: 1 })
  grupo: string;

  @Column({ length: 512 })
  descripcion: string;
}
