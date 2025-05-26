import { IsIn } from 'class-validator';
import { Proyecto } from 'src/modelos/proyecto/entities/proyecto.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BaseDeDato {
  /**
   * Comentario
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 50, unique: true })
  usuario: string;

  @Column({ nullable: false, length: 50, unique: true })
  nombre: string;

  @Column({ nullable: false, length: 512 })
  contrasenia: string;

  @Column({ nullable: true, length: 512 })
  url: string;

  @Column({ type: 'char', nullable: false, length: 1 })
  @IsIn(['S', 'N', 'P', 'M'], {
    message: 'SQL (S) y NoSQL (N), Postgress (P), MariaDB (M)',
  })
  tipo: string;

  @OneToOne(() => Proyecto, (proyecto) => proyecto.base_de_datos)
  proyecto: Proyecto;
}
